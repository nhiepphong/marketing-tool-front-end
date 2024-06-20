import * as React from "react";
import classNames from "classnames";
export interface IImageTextProps {
  text: string;
  className?: string;
  classSpacing?: string;
}

export default function ImageText({ text, className, classSpacing }: IImageTextProps) {
  return (
    <div className="flex">
      {text.split("").map((c, i) => (
        <img
          className={classNames(i !== 0 && classSpacing, className)}
          key={i}
          src={`/assets/images/texts/${["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(c) ? c : "sign"}.svg`}
          alt="text"
        />
      ))}
    </div>
  );
}
