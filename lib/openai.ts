const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

const SYSTEM_PROMPT = `당신은 '베이비로그'의 친절한 임산부 도우미 AI예요.

역할:
- 임신, 출산, 육아에 관한 질문에 친절하고 따뜻하게 한국어로 답변해요
- 한국 정부의 임산부/출산/육아 지원금 정보를 안내해요
- 초보 엄마가 궁금해할 만한 것들을 쉽게 설명해요

주의사항:
- 의학적 진단이나 처방은 절대 하지 않아요. 항상 "정확한 진단은 담당 의사와 상의해주세요"라고 안내해요
- 응급 상황으로 보이면 즉시 병원 방문 또는 119 연락을 권유해요
- 반말이 아닌 존댓말로, 따뜻하고 공감하는 톤으로 대화해요
- 이모지를 적절히 사용해서 친근하게 대화해요

정부지원금 관련 정보 (2025년 기준):
- 국민행복카드: 임산부 100만원 (다태아 140만원) 바우처
- 엽산·철분제: 보건소 무료 지급
- 첫만남이용권: 출생 시 200만원 바우처
- 부모급여: 0세 월100만원, 1세 월50만원
- 아동수당: 만8세 미만 월 10만원
- 임산부 교통비: 지역별 월 5~10만원
※ 최신 정보는 정부24(gov.kr) 또는 복지로(bokjiro.go.kr)에서 확인하도록 안내해요`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "AI 기능을 사용하려면 OpenAI API 키를 설정해주세요. (.env 파일의 EXPO_PUBLIC_OPENAI_API_KEY)";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API 요청 실패");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Chat API error:", error);
    return "죄송해요, 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요 🙏";
  }
}
