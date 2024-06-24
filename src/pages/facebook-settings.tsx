import React, { useState, useEffect } from "react";

const FacebookSettings: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [cookies, setCookies] = useState<string | null>(null);
  const [facebookPageUrl, setFacebookPageUrl] = useState<string | null>(null);

  useEffect(() => {}, [cookies]);

  const handleCookieChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCookies(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={cookies || ""}
        onChange={handleCookieChange}
        placeholder="Enter Facebook cookies"
      />
      {uid && (
        <div>
          Facebook UID: {uid}
          {facebookPageUrl && (
            <iframe
              src={facebookPageUrl}
              title="Facebook Profile"
              style={{
                width: "100%",
                height: "500px",
                border: "none",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FacebookSettings;
