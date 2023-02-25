import { Null } from "@/composable/user";
import { useMemo } from "react";
import { Container, Row } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";

export default function Banner() {
    const { author, message } = useMemo(() => {
      const messages = [
        {
          author: "Bris",
          message: "Have a great day Miss Ana!",
        },
        {
          author: "Bris",
          message: "Thank you for being your kind and amazing self Miss Ana",
        },
        {
          author: "Bris",
          message: "Thank you for spending your time keeping us locked up and entertained Miss Ana! We appreciate it",
        },
        {
          author: "Bris",
          message: "You're awesome!",
        },
        {
          author: "Bris",
          message: "I love being under your control Miss Ana!",
        },
        {
          author: "Nici",
          message: "Keep your head up, we don't want that crown slipping, Miss Ana!",
        },
        {
          author: "Nici",
          message: "Your truly dumb slut would love to make you smile and get humiliated!",
        },
        {
          author: "Nici",
          message: "멋진 하루 되세요 미스 아나",
        }
      ];
      
      const message = messages[Math.floor(Math.random() * messages.length)];

      const counts = Null.map(localStorage.getItem("messageCounts"), JSON.parse) || {};
      
      const key = JSON.stringify(message);
      
      counts[key] = counts[key] || 0;
      counts[key] += 1;

      localStorage.setItem("messageCounts", JSON.stringify(counts));
      
      const author = counts[key] > 4 ? message.author : "Simp";
      
      return { author, message: message.message };
    }, []);

    return (
      <Container style={{ paddingTop: '2rem' }}>
        <Row className="justify-content-center">
          <Toast>
            <Toast.Header>
              <strong className="me-auto">- {author}</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </Row>
      </Container>
    );
}