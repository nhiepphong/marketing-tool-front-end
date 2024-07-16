import React, { ChangeEvent, useEffect, useState } from "react";
import { GroupItem } from "../utils/interface.global";
import { showToast } from "../utils/showToast";
import ListViewFaebookChat from "../components/facebook/ListViewFaebookChat";
import { getTimeNowToString } from "../utils/utils";

const FacebookChat: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [isMessageExpanded, setIsMessageExpanded] = useState(true);
  const [isReportExpanded, setIsReportExpanded] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [delay, setDelay] = useState<number>(3);
  const [cookie, setCookie] = useState("");

  const [listGroup, setListGroup] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [textReload, setTextReload] = useState("");

  const [dataSend, setDataSend] = useState<any>(null);

  useEffect(() => {
    window.electronAPI.readCookieFile().then((savedCookie: string) => {
      setCookie(savedCookie);
    });
    window.electronAPI.onUpdateStatusChatFunction((event, data: any) => {
      setAlertMessage(data.message);
      setTextReload("1|" + getTimeNowToString());
    });
    getAllGroup();
  }, []);

  const getAllGroup = async () => {
    const tmp = await window.electronAPI.getAllGroup();
    setListGroup(tmp);
  };

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (listGroup.length > 0) {
      for (let group of listGroup) {
        if (group.id == parseInt(e.target.value)) {
          setSelectedGroup(group);
          break;
        }
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleDelayChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDelay(parseInt(e.target.value));
  };
  const onRunChat = async () => {
    if (message == "") {
      showToast({ type: "error", message: "Vui lòng nhập tin nhắn cần gửi" });
      return;
    }
    if (delay == 0) {
      showToast({
        type: "error",
        message: "Vui lòng nhập thời gian delay > 0",
      });
      return;
    }

    console.log("message", message);
    console.log("Delay", delay);
    console.log("file", file);
    await window.electronAPI.updateIsSendAllDataFromDB(0);
    setDataSend({ message: message, delay: delay, file: file, status: true });
  };

  useEffect(() => {
    onStartSend();
  }, [dataSend]);

  const onStartSend = async () => {
    console.log("dataSend", dataSend);
    if (dataSend && dataSend.status == true && selectedGroup) {
      console.log("Send", dataSend);
      setIsLoading(true);
      setAlertMessage("Đang khởi tạo...");
      const tmp = await window.electronAPI.onSendChatToUser(
        cookie,
        dataSend,
        selectedGroup.id
      );

      console.log("Result", tmp);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gửi tin nhắn hàng loạt</h1>
      {alertMessage !== "" ? (
        <div className="mb-4 text-center text-[green]">
          <p className="bg-gray-100 px-4 py-2 rounded">{alertMessage}</p>
        </div>
      ) : (
        <></>
      )}
      <div className="mb-4">
        <button
          className="w-full bg-blue-500 text-white p-2 rounded flex justify-between items-center"
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
        >
          <span>Chọn danh sách UID gửi</span>
          <span>{isConfigExpanded ? "▲" : "▼"}</span>
        </button>
        {isConfigExpanded && (
          <div className="mt-4 space-y-4 bg-gray-100 p-4 rounded">
            <div>
              <label className="block mb-2">Chọn nhóm:</label>
              <select
                value={selectedGroup?.id}
                onChange={handleGroupChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Chọn một nhóm</option>
                {listGroup.length > 0 ? (
                  listGroup.map((group, index) => (
                    <option value={group.id} key={group.id}>
                      {group.name} - {group.count_data} - {group.date}
                    </option>
                  ))
                ) : (
                  <></>
                )}
              </select>
            </div>

            {/* <div>
              <label className="block mb-2">Chọn file CSV:</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            </div> */}
          </div>
        )}
      </div>
      <div className="mb-4">
        <button
          className="w-full bg-blue-500 text-white p-2 rounded flex justify-between items-center"
          onClick={() => setIsMessageExpanded(!isMessageExpanded)}
        >
          <span>Cấu hình nội dung</span>
          <span>{isMessageExpanded ? "▲" : "▼"}</span>
        </button>
        {isMessageExpanded && (
          <div className="mt-4 space-y-4 bg-gray-100 p-4 rounded">
            <div>
              <label className="block mb-2">Nội dung tin nhắn:</label>
              <textarea
                value={message}
                onChange={handleMessageChange}
                className="w-full p-2 border rounded"
                rows={4}
              ></textarea>
              <p>
                <i>Bạn có thể sử dụng các cú pháp động như sau:</i>
                <br />
                <i>
                  <b>&#123;name&#125;</b> để thay thế cho tên
                </i>
                <br />
                <i>
                  <b>&#123;gender&#125;</b> để thay thế cho xưng hô: Anh/Chị
                </i>
              </p>
            </div>
            <div>
              <label className="block mb-2">Chọn file hình gửi:</label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Thời gian delay (giây):</label>
              <input
                type="number"
                value={delay}
                onChange={handleDelayChange}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          className="w-full bg-blue-500 text-white p-2 rounded flex justify-between items-center"
          onClick={() => setIsReportExpanded(!isReportExpanded)}
        >
          <span>Báo cáo gửi tin nhắn</span>
          <span>{isReportExpanded ? "▲" : "▼"}</span>
        </button>
        {isReportExpanded && (
          <div className="mt-4 bg-gray-100 p-4 rounded">
            <div>
              <button
                onClick={onRunChat}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Gửi tin nhắn
              </button>
            </div>
            <div className="mt-4">
              <ListViewFaebookChat
                isLoading={false}
                group={selectedGroup}
                textReload={textReload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookChat;
