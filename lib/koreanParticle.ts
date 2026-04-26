// 한글 단어의 마지막 글자 받침 유무에 따라 조사를 골라준다.
// 한자/영문 등 비한글로 끝나는 경우 보수적으로 받침 없음으로 처리한다.

function hasJongseong(word: string): boolean {
  if (!word) return false;
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);
  // 한글 음절 범위: AC00 ~ D7A3
  if (code < 0xac00 || code > 0xd7a3) return false;
  // (code - 0xAC00) % 28 === 0 이면 받침 없음
  return (code - 0xac00) % 28 !== 0;
}

export function eunNeun(word: string): string {
  return hasJongseong(word) ? "은" : "는";
}

export function iGa(word: string): string {
  return hasJongseong(word) ? "이" : "가";
}

export function eulReul(word: string): string {
  return hasJongseong(word) ? "을" : "를";
}

export function gwaWa(word: string): string {
  return hasJongseong(word) ? "과" : "와";
}
