import classnames from "classnames";

interface ImageButtonProps {
  imageSrc: string;
  altText: string;
  onClick: () => void;
  className?: string;
  text?: string;
  textClassName?: string;
}

function ImageButton({
  imageSrc,
  altText,
  onClick,
  className,
  text,
  textClassName,
}: ImageButtonProps) {
  return (
    <button
      onClick={onClick}
      className={classnames(
        "cursor-pointer bg-transparent border-none p-0 relative",
        className
      )}
    >
      <img src={imageSrc} alt={altText} className="w-full h-auto m-auto" />
      <span
        className={classnames(
          "absolute w-full text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          textClassName
        )}
      >
        {text}
      </span>
    </button>
  );
}

export default ImageButton;
