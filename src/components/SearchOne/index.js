import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextFieldCpn } from "../../basicComponents";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import { ReactComponent as IC_SEARCH } from "../../asset/images/search.svg";

const SearchOne = ({
  label,
  name,
  searchSubmit = () => {},
  process = false,
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchSubmit(searchValue);
    }
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };
  return (
    <div className="flex align-item-end">
      <TextFieldCpn
        label={label}
        search={true}
        value={searchValue}
        onKeyPress={handleKeyPress}
        onChange={handleChange}
        name={name || "searchOne"}
      />
      <button
        style={{
          height: "var(--heightInput)",
          width: "var(--heightInput)",
          border: "1px solid var(--gray4)",
          borderRadius: "4px",
          paddingRight: "5px",
          paddingBottom: "3px",
        }}
        onClick={() => searchSubmit(searchValue)}
        className="ml-1"
      >
        {process ? (
          <AutorenewIcon fontSize="small" className="button-loading" />
        ) : (
          <IC_SEARCH />
        )}
      </button>
    </div>
  );
};

export default SearchOne;
