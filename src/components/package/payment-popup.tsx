import React, { useEffect, useState } from "react";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  transferContent: string;
}

const PaymentPopup: React.FC<PaymentPopupProps> = ({
  isOpen,
  onClose,
  amount,
  transferContent,
}) => {
  const [bank, setBank] = useState<any | null>({
    name: "Ngân hàng TMCP Quân đội",
    bin: "970422",
    accountNumber: "8668393939",
    accountName: "TRẦN DUY PHONG",
    branch: "Quận 9",
    content: "",
  });

  useEffect(() => {
    if (isOpen) {
      setBank({
        name: "Ngân hàng TMCP Quân đội",
        bin: "970422",
        accountNumber: "8668393939",
        accountName: "TRẦN DUY PHONG",
        branch: "Quận 9",
        content: transferContent,
      });
    }
  }, [isOpen]);

  const getLinkQRCode = () => {
    return `https://img.vietqr.io/image/${bank.bin}-${bank.accountNumber}-compact.jpg?amount=${amount}&addInfo=${bank.content}&accountName=${bank.accountName}`;
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 flex">
              <div className="w-1/2 pr-4 border-r border-gray-200">
                <img src={getLinkQRCode()} alt="QR Code" className="w-full" />
              </div>
              <div className="w-1/2 pl-4">
                <h3 className="text-lg font-semibold mb-4">
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Ngân hàng:</span> {bank.name}
                  </p>
                  <p>
                    <span className="font-medium">Số tài khoản:</span>{" "}
                    {bank.accountNumber}
                  </p>
                  <p>
                    <span className="font-medium">Chủ tài khoản:</span>{" "}
                    {bank.accountName}
                  </p>
                  <p>
                    <span className="font-medium">Số tiền:</span>{" "}
                    {amount.toLocaleString()} VND
                  </p>
                  <p>
                    <span className="font-medium">Nội dung chuyển tiền:</span>{" "}
                    {transferContent}
                  </p>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Lưu ý nhập đúng cú pháp hệ thống sẽ nạp tự động hoặc bạn có
                  thể quét mã QR. Vui lòng đợi từ 3 - 5 phút để hệ thống ghi
                  nhận sau khi chuyển khoản.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 px-6 py-3 flex justify-end rounded-b-lg">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : (
        <> </>
      )}
    </>
  );
};

export default PaymentPopup;
