import prettyMilliseconds from "pretty-ms";

const getDeltaTime: Record<string, (_: any) => number> = {
    "time_changed": (e: any) => e.payload.duration,
    "pillory_out": (e: any) => e.payload.timeAdded,
    "link_time_changed": (e: any) => e.payload.duration,
};
    
const timeChangedExtensions: Record<string, (_: any) => string> = {
    "wheel-of-fortune": (e: any) => `Wheel of fortune ${e.payload.duration > 0 ? "added" : "removed"} ${prettyMilliseconds(Math.abs(e.payload.duration) * 1000)}`,
};

const getDescription: Record<string, (_: any) => string> = {
    "time_changed": (e) => timeChangedExtensions[e.extension] ? timeChangedExtensions[e.extension](e) : `%USER% ${e.payload.duration > 0 ? "added" : "removed"} ${prettyMilliseconds(Math.abs(e.payload.duration) * 1000)}`,
    "pillory_in": (e) => `${e.payload.reason}, put in pillory for ${prettyMilliseconds(e.payload.duration * 1000)}`,
    "pillory_out": (e) => `%USER% got you out of pillory, ${prettyMilliseconds(e.payload.timeAdded * 1000)} added`,
    "tasks_task_completed": (e) => `%USER% completed the task "${e.payload.task.task}"`,
    "tasks_task_assigned": (e) => `%USER% started the task "${e.payload.task.task}"`,
    "wheel_of_fortune_turned": (e) => `%USER% rolled "${e.description}" in the wheel of fortune`,
    "link_time_changed": (e) => `%USER% voted for the lock, ${e.payload.duration > 0 ? "adding" : "removing"} ${prettyMilliseconds(Math.abs(e.payload.duration) * 1000)}`,
    "max_limit_date_increased": (e) => `%USER% increased the maximum date. ${e.description}`,
};

type Event = { date: Date, timeDelta: number, description: string, frozen: boolean };

const timeFrozen = (data: Event[]) => {
    let sum = 0;
    let frozenAt: null | Date = null;

    for (const event of data) {
        if (frozenAt === null) {
            if (event.frozen) {
                frozenAt = event.date;
            }
        } else {
            if (!event.frozen) {
                sum += (event.date.getTime() - frozenAt.getTime()) / 1000;
                frozenAt = null;
            }
        }
    }

    if (frozenAt !== null) {
        sum += (Date.now() - frozenAt.getTime()) / 1000;
    }

    return sum;
}

export const parseHistory = (history: any[], lock: any) => {
    let data: Event[] = [];

    history.reverse();

    for (let i = 0; i < history.length; i++) {
        const e = history[i];

        const getDeltaTimeEvent = getDeltaTime[e.type];
        const getDescriptionEvent = getDescription[e.type];

        let frozen: boolean = i == 0 ? false : data[i - 1].frozen;

        if (e.type === "lock_frozen") frozen = true;
        if (e.type === "lock_unfrozen") frozen = false;

        data.push({
            date: new Date(Date.parse(e.createdAt)),
            timeDelta: getDeltaTimeEvent ? getDeltaTimeEvent(e) : 0,
            description: (getDescriptionEvent ? getDescriptionEvent(e) : e.title).replace("%USER%", e.user?.username || `The extension ${e.extension}`).replace("bBris", "Bris"),
            frozen,
        });
    }

    data.forEach((event, i) => (console.log(event.description), console.log({ event, data: history[i] })));

    const deltaSum = data.reduce((c, d) => c + d.timeDelta, 0) + timeFrozen(data);
    const totalLockDuration = (Date.parse(lock.endDate) - Date.parse(lock.startDate)) / 1000;

    const initialTime = totalLockDuration - deltaSum;

    data[0].timeDelta = initialTime;

    return data;
}