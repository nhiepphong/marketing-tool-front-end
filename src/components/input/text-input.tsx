export interface ITextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextInput({
  value,
  onChange,
  placeholder,
}: ITextInputProps) {
  return (
    <div className="input">
      <input
        type="text"
        className="w-full text-[12px] h-5 bg-white rounded-lg p-4 z-10 relative"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
