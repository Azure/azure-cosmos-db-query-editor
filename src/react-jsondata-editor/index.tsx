import React, { useContext, useRef } from "react";
import Editor from "./Editor";
import styles from "./lib/styles.module.css";
import UserContext from "./UserContext";

// TODO Remove this and fix the any's
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Gets a JSON object and a callback function and calls Editor component
 * Creates a current reference and passes to Editor component
 *
 * @param jsonInput a JSON Object from a user
 * @param onChange a callback function that returns JSON Object
 * @returns {JSX.Element}
 *
 */
const JsonEditor = ({
  jsonObject,
  onChange,
  theme,
  hideInsertObjectButton,
  expandToGeneration,
  isReadOnly,
  bannerStyle,
  keyStyle,
  valueStyle,
  buttonStyle,
}: {
  jsonObject: any;
  onChange: (value: any) => void;
  theme?: any;
  hideInsertObjectButton: boolean;
  expandToGeneration: number;
  isReadOnly: boolean;
  bannerStyle?: any;
  keyStyle?: any;
  valueStyle?: any;
  buttonStyle?: any;
}): JSX.Element => {
  const jsonBoxRef = useRef<HTMLDivElement>(null);
  const defaultStyle = useContext(UserContext);

  return (
    <UserContext.Provider
      value={{
        themes: theme === undefined ? defaultStyle.themes : theme,
        banner: bannerStyle === undefined ? defaultStyle.banner : bannerStyle,
        key: keyStyle === undefined ? defaultStyle.key : keyStyle,
        values: valueStyle === undefined ? defaultStyle.values : valueStyle,
        buttons: buttonStyle === undefined ? defaultStyle.buttons : buttonStyle,
      }}
    >
      <div className={styles.container} ref={jsonBoxRef}>
        <Editor
          input={jsonObject}
          jsonBoxRef={jsonBoxRef}
          onChange={onChange}
          hideInsertObjectButton={hideInsertObjectButton}
          expandToGeneration={expandToGeneration}
          isReadOnly={isReadOnly}
        />
      </div>
    </UserContext.Provider>
  );
};

export { JsonEditor };
