import React, { useState } from "react";
import "./Account.css";

function AccountHelpdesk(props) {
  let [showDrop, setShowDrop] = useState(false);
  let [topic, setTopic] = useState("");
  return (
    <>
      <div className={"AccountMain-Header"}>
        <h2>HELPDESK</h2>
        <p>Contact us for your queries</p>
      </div>
      <div className={"AccountMain-HelpDesk"}>
        <div className={"AccountMain-HelpDesk-Contact"}>
          <div className={"AccountMain-HelpDesk-Contact-Header"}>
            <h2>POINTS OF CONTACT</h2>
          </div>
          <div className={"AccountMain-HelpDesk-Contact-Element"}>
            <h2>INFORMATION & SALES</h2>
            <p>SALES@SUKISOFT.COM</p>
          </div>
          <div className={"AccountMain-HelpDesk-Contact-Element"}>
            <h2>SUPPORT</h2>
            <p>support@SUKISOFT.COM</p>
          </div>
          <div className={"AccountMain-HelpDesk-Contact-Element"}>
            <h2>OFFICE ADDRESS</h2>
            <p
              className={"AccountMain-HelpDesk-Contact-Element-Office-Country"}
            >
              INDIA
            </p>
            <span>
              No 9, Prasanth Colony, 3rd Street, Sembakkam,
              <br /> Tambaram, Chennai - 600073
              <br /> Chennai, Tamilnadu
              <br /> India
            </span>
          </div>
        </div>

        <div className={"AccountMain-FormContainer"}>
          <div className={"row"}>
            <div className={"InputContainer"}>
              <p>
                EMAIL ADDRESS <span>(so we can reply to you)</span>
              </p>
              <input type={"email"} placeholder={"Email Address"} />
            </div>
          </div>
          <div className={"row"}>
            <div className={"InputContainer"}>
              <p>
                SELECT A TOPIC <span>(WHY YOU ARE REACHING OUT)</span>
              </p>
              <div className={"dropdown"}>
                <div
                  className={"dropdownOption"}
                  onClick={() => setShowDrop((prev) => !prev)}
                >
                  <p
                    style={
                      topic
                        ? { color: "var(--primary-text-black)" }
                        : { color: "rgba(44, 44, 44, 0.50)" }
                    }
                  >
                    {topic || "Topic"}
                  </p>
                  <i
                    className="ph-bold ph-caret-down"
                    style={showDrop ? { transform: "rotate(180deg)" } : {}}
                  ></i>
                </div>
                {showDrop && (
                  <div className={"dropOtherOptions"}>
                    <div
                      className={"dropdownOption  hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Shipping and Delivery Issues");
                      }}
                    >
                      <p>Shipping and Delivery Issues</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Product Information");
                      }}
                    >
                      <p>Product Information</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Payments Issues");
                      }}
                    >
                      <p>Payments Issues</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Technical Support");
                      }}
                    >
                      <p>Technical Support</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Product Defects or Complaints");
                      }}
                    >
                      <p>Product Defects or Complaints</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Feedback and Suggestions");
                      }}
                    >
                      <p>Feedback and Suggestions</p>
                    </div>
                    <div
                      className={"dropdownOption hoverAvailable"}
                      onClick={() => {
                        setShowDrop(false);
                        setTopic("Other");
                      }}
                    >
                      <p>Other</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={"row"}>
            <div className={"InputContainer"}>
              <p>
                Subject <span>(subject of the query)</span>
              </p>
              <input type={"text"} placeholder={"Subject"} />
            </div>
          </div>
          <div className={"row"}>
            <div className={"InputContainer"}>
              <p>
                Message <span>(a short message on your querY)</span>
              </p>
              <textarea></textarea>
              {/*<input type={""} placeholder={"Subject"} />*/}
            </div>
          </div>
          <div
            className={"AccountMain-ButtonContainer"}
            style={{ paddingTop: "0" }}
          >
            <button>
              <p>Send Message</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountHelpdesk;
