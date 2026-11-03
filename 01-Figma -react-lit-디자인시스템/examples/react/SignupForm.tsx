// React 앱에서 사용하는 예 (npm i @k3i/ds lit @lit/react)
import "@k3i/ds/tokens.css";
import { Button, Card, Input } from "@k3i/ds/react";
import { useState } from "react";

export function SignupForm() {
  const [email, setEmail] = useState("");

  return (
    <Card elevated>
      <h2 slot="header">회원가입</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <Input
          name="email"
          type="email"
          label="이메일"
          required
          value={email}
          onDsInput={(e) => setEmail(e.detail.value)}
        />
        <Button type="submit" variant="primary" fullWidth>
          가입
        </Button>
      </form>
    </Card>
  );
}

// React 19 이상이라면 래퍼 없이도 동작한다:
// <ds-button variant="primary" onClick={save}>저장</ds-button>
