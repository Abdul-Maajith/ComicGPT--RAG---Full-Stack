```javascript
  const onSubmit = async (value: string) => {
    const response = await fetch("http://localhost:8000/api/chat/agent", {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: "rBP6YPni0vf8JYM53J0Xe8GLxj62",
        agentId: "65c4f645c68973ffab8a8d30",
        userInput: value,
        sessionId: 876880,
      }),
    });

    const body = response.body as ReadableStream;
    const reader = body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

    }
  };

```