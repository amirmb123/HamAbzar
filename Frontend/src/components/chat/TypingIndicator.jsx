import Avatar from "../common/Avatar";

export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 self-start">
      <Avatar name={name} size="sm" />
      <div className="flex gap-1 rounded-lg rounded-br-[4px] border border-gray-100 bg-white px-4 py-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.2s" }}
          />
        ))}
      </div>
    </div>
  );
}
