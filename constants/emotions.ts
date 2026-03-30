export interface Emotion {
  key: string;
  emoji: string;
  label: string;
  color: string;
}

export const EMOTIONS: Emotion[] = [
  { key: "happy", emoji: "😊", label: "행복해요", color: "#FFD93D" },
  { key: "love", emoji: "🥰", label: "사랑스러워요", color: "#FF6B81" },
  { key: "excited", emoji: "🤩", label: "설레요", color: "#FF8FA3" },
  { key: "calm", emoji: "😌", label: "평온해요", color: "#B5EAD7" },
  { key: "tired", emoji: "😴", label: "피곤해요", color: "#D4BBFF" },
  { key: "worried", emoji: "😟", label: "걱정돼요", color: "#FFE8D6" },
  { key: "sick", emoji: "🤢", label: "입덧이에요", color: "#C8E6C9" },
  { key: "emotional", emoji: "🥺", label: "눈물나요", color: "#BBDEFB" },
];
