import React, { useContext, useEffect, useState } from "react";
import goi_co_ban from "../assets/goi-co-ban.jpg";
import goi_tieu_chuan from "../assets/goi-tieu-chuan.jpg";
import goi_nang_cao from "../assets/goi-nang-cao.jpg";
import goi_chuyen_nghiep from "../assets/goi-chuyen-nghiep.jpg";
import goi_doanh_nghiep from "../assets/goi-doanh-nghiep.jpg";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../redux/slices/userSlices";
import { buyPackageByAPI, getAllPackagesByAPI } from "../api/store";
import { showToast } from "../utils/showToast";
import DataContext from "../context/DataContext";
import PaymentPopup from "../components/package/payment-popup";
import qrcode_thanh_toan from "../assets/qrcode-thanh-toan.png";

interface PackageGroupProps {
  type: {
    id: number;
    name: string;
    image: string;
  };
  packages: PackageProps[];
}

interface PackageProps {
  id: number;
  name: string;
  image: string;
  price: number;
  priceAfterDiscount?: number;
  countCanUser: number;
  link?: string;
}
const Package: React.FC<PackageProps> = ({
  id,
  name,
  image,
  price,
  priceAfterDiscount,
  countCanUser,
  link,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [codePayment, setCodePayment] = useState("");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  const onClickBuy = () => {
    setIsLoading(true);
    onBuyPackage();
  };

  const onBuyPackage = async () => {
    const result: any = await buyPackageByAPI(
      { id: id },
      dataUser.token.accessToken
    );
    setIsLoading(false);
    console.log("onBuyPackage", result);
    if (result.status === 200) {
      if (result.data.status) {
        setCodePayment(result.data.data.codePayment);
        setIsPaymentPopupOpen(true);
      } else {
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      showToast({ type: "error", message: result.data.message });
    }
  };
  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
        <img
          src={link + image}
          alt={name}
          className="w-full h-32 object-cover"
        />
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{name}</h3>
            <div className="mb-2 h-14 flex flex-col justify-center">
              {priceAfterDiscount ? (
                <>
                  <span className="text-gray-500 line-through text-sm">
                    {price.toLocaleString()} đ
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    {priceAfterDiscount.toLocaleString()} đ
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-indigo-600">
                  {price.toLocaleString()} đ
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Số lượng: {countCanUser.toLocaleString()} Lead
            </p>
          </div>
          {isLoading ? (
            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 text-sm mt-auto">
              Đang xử lý...
            </button>
          ) : (
            <button
              onClick={onClickBuy}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 text-sm mt-auto"
            >
              Mua ngay
            </button>
          )}
        </div>
      </div>
      <PaymentPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        amount={priceAfterDiscount || price}
        transferContent={codePayment}
      />
    </>
  );
};

const PackagesPage: React.FC = () => {
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const { isNeedGetNewToken, setIsNeedGetNewToken } = useContext(DataContext)!;
  const [packages, setPackages] = useState<PackageGroupProps[]>([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (dataUser) {
      getAllPackages();
    }
  }, [dataUser]);

  const getAllPackages = async () => {
    const result: any = await getAllPackagesByAPI(
      {},
      dataUser.token.accessToken
    );
    console.log("getAllPackages", result);
    if (result && result.status === 200) {
      setPackages(result.data.data);
      setLink(result.data.link);
    } else if (result && result.status === 403) {
      setIsNeedGetNewToken(true);
    } else {
      showToast({ type: "error", message: "Error" });
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Gói Sử Dụng</h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto">
        Chọn gói phù hợp với nhu cầu của bạn. Chúng tôi cung cấp nhiều lựa chọn
        để đáp ứng mọi quy mô từ cá nhân đến doanh nghiệp lớn. Nâng cấp hoặc hạ
        cấp bất cứ lúc nào để tối ưu hóa chi phí và hiệu suất.
      </p>
      <div className="max-w-full mx-auto">
        {packages.length > 0 ? (
          packages.map((item: PackageGroupProps, index: number) => (
            <div className="max-w-full mx-auto pt-6">
              <h1 className="text-2xl font-bold text-center mb-4">
                {item.type.name}
              </h1>
              <div className="flex flex-nowrap overflow-x-auto space-x-4 pb-4">
                {item.packages.map((pkg: PackageProps, index1: number) => (
                  <div key={index + "-" + index1} className="flex-none w-64">
                    <Package {...pkg} link={link} />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
