import React from "react";
import goi_co_ban from "../assets/goi-co-ban.jpg";
import goi_tieu_chuan from "../assets/goi-tieu-chuan.jpg";
import goi_nang_cao from "../assets/goi-nang-cao.jpg";
import goi_chuyen_nghiep from "../assets/goi-chuyen-nghiep.jpg";
import goi_doanh_nghiep from "../assets/goi-doanh-nghiep.jpg";
interface PackageProps {
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  usage: number;
}

const Package: React.FC<PackageProps> = ({
  name,
  image,
  price,
  discountPrice,
  usage,
}) => (
  <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
    <img src={image} alt={name} className="w-full h-32 object-cover" />
    <div className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <div className="mb-2 h-14 flex flex-col justify-center">
          {discountPrice ? (
            <>
              <span className="text-gray-500 line-through text-sm">
                {price.toLocaleString()} VND
              </span>
              <span className="text-xl font-bold text-indigo-600">
                {discountPrice.toLocaleString()} VND
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-indigo-600">
              {price.toLocaleString()} VND
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4">Số lượng sử dụng: {usage}</p>
      </div>
      <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 text-sm mt-auto">
        Mua ngay
      </button>
    </div>
  </div>
);

const PackagesPage: React.FC = () => {
  const packages: PackageProps[] = [
    {
      name: "Gói Cơ Bản",
      image: goi_co_ban,
      price: 100000,
      usage: 100,
    },
    {
      name: "Gói Tiêu Chuẩn",
      image: goi_tieu_chuan,
      price: 250000,
      discountPrice: 200000,
      usage: 300,
    },
    {
      name: "Gói Nâng Cao",
      image: goi_nang_cao,
      price: 500000,
      usage: 700,
    },
    {
      name: "Gói Chuyên Nghiệp",
      image: goi_chuyen_nghiep,
      price: 1000000,
      discountPrice: 800000,
      usage: 1500,
    },
    {
      name: "Gói Doanh Nghiệp",
      image: goi_doanh_nghiep,
      price: 2000000,
      usage: 5000,
    },
  ];

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Gói Sử Dụng</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Chọn gói phù hợp với nhu cầu của bạn. Chúng tôi cung cấp nhiều lựa chọn
        để đáp ứng mọi quy mô từ cá nhân đến doanh nghiệp lớn. Nâng cấp hoặc hạ
        cấp bất cứ lúc nào để tối ưu hóa chi phí và hiệu suất.
      </p>
      <div className="flex flex-nowrap overflow-x-auto space-x-4 pb-4">
        {packages.map((pkg, index) => (
          <div key={index} className="flex-none w-64">
            <Package {...pkg} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagesPage;
