import React, { useEffect, useState } from "react";
import ListViewFaebook from "../components/facebook/ListViewProps";
import { GroupItem } from "../utils/interface.global";

const FacebookHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [groupSelected, setGroupSelected] = useState<GroupItem | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [textReload, setTextReload] = useState("");

  useEffect(() => {
    getAllGroup();
  }, []);

  const getAllGroup = async () => {
    const tmp = await window.electronAPI.getAllGroup();
    console.log("getAllGroup", tmp);
    setGroups(tmp);
  };

  const onChangeGroup = (id: number) => {
    if (groups.length > 0) {
      for (let group of groups) {
        if (group.id == id) {
          setGroupSelected(group);
          break;
        }
      }
    }
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Lịch sử</h1>
      <div className="mb-4">
        <div className="flex mb-4">
          <select
            value={groupSelected?.id}
            onChange={(e) => onChangeGroup(parseInt(e.target.value))}
            className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="0" disabled selected>
              Hãy chọn Group muốn xem
            </option>
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <option value={group.id} key={group.id}>
                  {group.name} - {group.date}
                </option>
              ))
            ) : (
              <></>
            )}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <ListViewFaebook
          isLoading={isLoading}
          group={groupSelected}
          textReload={textReload}
        />
      </div>
    </div>
  );
};

export default FacebookHistory;
