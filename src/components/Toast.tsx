import { IconCheck } from "@/components/icons";

interface Props {
  message: string;
}

export default function Toast({ message }: Props) {
  return (
    <div className="toast" role="status">
      <IconCheck size={14} strokeWidth={2.2} className="toast__icon" />
      <span className="toast__msg">{message}</span>
    </div>
  );
}
