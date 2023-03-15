import styles from "./lib/styles.module.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import DeepCopy from "./lib/DeepCopy";
import pointer from "json-pointer";
import ModalEditor from "./ModalEditor";
import JsonView from "./JsonView";
import UserContext from "./UserContext";
import ModalPrimitive from "./ModalPrimitive";

// TODO Remove this and fix the any's
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates new JSON Object by copying a JSON Object
 * Manipulates new JSON Object and return the JSON Object to a user
 * Calls DisplayJson component to display
 * Calls ModalEditor to add an Object when a users clicks top Insert object <div>
 *
 * @param input a JSON string from a user
 * @param jsonBoxRef a parent reference that has a current position
 * @param onChange a callback function that returns JSON string
 * @returns {JSX.Element}
 *
 */
export default function Editor({
  input,
  jsonBoxRef,
  onChange,
  hideInsertObjectButton,
  expandToGeneration,
  isReadOnly,
}: {
  input: string;
  jsonBoxRef: React.RefObject<HTMLDivElement>;
  onChange: (value: unknown) => void;
  hideInsertObjectButton: boolean;
  expandToGeneration: number;
  isReadOnly: boolean;
}) {
  const emptyValues: {
    path: string | undefined;
    field: string | undefined;
    value: unknown | undefined;
    isInArray: boolean | undefined;
  } = {
    path: undefined,
    field: undefined,
    value: undefined,
    isInArray: undefined,
  };

  // indicates y-scroll
  const jsonListOutput = useRef<HTMLDivElement>(null);
  // new json object to manipulate
  const [jsonData, setJsonData] = useState<unknown>();
  // blocks focus while a user edits
  const [overlay, setOverlay] = useState(false);
  // shows modal editor
  const [editObject, setEditObject] = useState(emptyValues);
  // indicates position click node
  const [currentTop, setCurrentTop] = useState(0);
  const [editPrimitive, setEditPrimitive] = useState();
  const [selectType, setSelectType] = useState(false);

  const userStyle = useContext(UserContext);
  // indicates hover event
  const [focusOnBanner, setFocusOnBanner] = useState(false);

  //setPrimitive
  let tempObj = DeepCopy(jsonData);

  // re-render when input changes
  useEffect(() => {
    setJsonData(toJSON(input));
    setOverlay(false);
    setEditPrimitive(undefined);
  }, [input]);

  // calls onChange when data changes
  const saveJsonData = (newData: unknown, deepCopy?: boolean): void => {
    if (deepCopy) {
      setJsonData(DeepCopy(newData));
    } else {
      setJsonData(newData);
    }

    onChange(JSON.stringify(newData, null, " "));
  };

  const toJSON = (jsonStr: string): unknown => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return undefined;
    }
  };

  // delete json object
  const deleteNode = (path: string | undefined): void => {
    if (path === "") {
      tempObj = undefined;
      saveJsonData(undefined);
    } else if (path !== undefined) {
      pointer.remove(tempObj, path);
      saveJsonData(tempObj, tempObj instanceof Object);
    }

    if (overlay) {
      setOverlay(false);
    }
  };

  // saves information for modal primitive
  const setPrimitive = (value: any, position?: number): void => {
    if (position !== undefined) {
      setCurrentTop(position);
    }
    setEditPrimitive(value);
  };

  // changes primitive value
  const savePrimitive = (inputText: string): void => {
    if (inputText !== undefined) {
      let tempValue;

      if (inputText.charAt(0) === '"' && inputText.endsWith('"')) {
        tempValue = inputText.slice(1, -1);
      } else if (inputText === "null") {
        tempValue = null;
      } else if (inputText === "true" || inputText === "false") {
        tempValue = inputText === "true";
      } else if (!Number.isNaN(Number(inputText))) {
        tempValue = Number(inputText);
      } else {
        tempValue = inputText;
      }

      saveJsonData(tempValue);
    }

    setEditPrimitive(undefined);
  };

  // modify json object
  const changeNode = (path: string, value: any): void => {
    if (jsonData === undefined || path === "") {
      tempObj = value;
      saveJsonData(tempObj, tempObj instanceof Object);
    } else {
      if (path === "/") {
        if (jsonData instanceof Array) {
          const arrayIndex = pointer.get(jsonData, "").length;

          Object.entries(value).map(([key, value]) => {
            pointer.set(tempObj, "/" + arrayIndex + "/" + key, value);
          });
        } else {
          if (!(jsonData instanceof Object)) {
            tempObj = {};
          }

          Object.entries(value).map(([key, value]) => {
            pointer.set(tempObj, "/" + key, value);
          });
        }

        saveJsonData(tempObj, true);
      } else {
        pointer.set(tempObj, path, value);
        saveJsonData(tempObj, true);
      }
    }

    setOverlay(false);
  };

  // saves information for modal editor
  const createModal = (
    path: string,
    field?: string,
    value?: unknown,
    isInArray?: boolean,
    position?: number
  ): void => {
    if (field === undefined && jsonData instanceof Array) {
      setEditObject({
        path: "/",
        field, // TODO Check this: Array.from(jsonData).length,
        value: jsonData,
        isInArray,
      });
    } else {
      setEditObject({
        path,
        field,
        value,
        isInArray,
      });
    }

    if (position !== undefined) {
      setCurrentTop(position);
    }
    setOverlay(true);
  };

  return (
    <div className={styles.editorContainer}>
      {overlay && (
        <div>
          <div
            className={styles.overlay}
            style={{
              width: jsonBoxRef.current?.offsetWidth,
              height: jsonBoxRef.current?.offsetHeight,
            }}
          />
          <div style={{ top: currentTop, position: "absolute" }}>
            <ModalEditor
              editObject={editObject}
              changeNode={changeNode}
              deleteNode={deleteNode}
            />
          </div>
        </div>
      )}

      {editPrimitive !== undefined && (
        <div>
          <div
            className={styles.overlay}
            style={{
              width: jsonBoxRef.current?.offsetWidth,
              height: jsonBoxRef.current?.offsetHeight,
            }}
          />
          <div style={{ top: currentTop, position: "absolute" }}>
            <ModalPrimitive
              primitiveValue={editPrimitive}
              savePrimitive={savePrimitive}
            />
          </div>
        </div>
      )}

      {jsonData === undefined && selectType && (
        <div className={styles.modalContainer} style={{ minWidth: "300px" }}>
          <div>
            <label
              className={styles.modalSelectLabel}
              style={{ font: userStyle.key.font }}
            >
              Please select type of new data
            </label>
          </div>
          <div className={styles.modalSelectBtnContainer}>
            <button
              type={"button"}
              className={styles.modalSelectBtn}
              style={{ backgroundColor: userStyle.themes.color }}
              onClick={() => {
                setPrimitive("");
                setSelectType(false);
              }}
            >
              <span
                style={{ font: userStyle.values.font, lineHeight: "normal" }}
              >
                Text
              </span>
            </button>
            <button
              type={"button"}
              className={styles.modalSelectBtn}
              style={{ backgroundColor: userStyle.themes.color }}
              onClick={() => {
                createModal("");
                setSelectType(false);
              }}
            >
              <span
                style={{ font: userStyle.values.font, lineHeight: "normal" }}
              >
                Object
              </span>
            </button>
          </div>
        </div>
      )}

      <div key={"jsonBody"} className={styles.JsonViewOutput}>
        {!hideInsertObjectButton && !isReadOnly && (
          <div
            className={styles.insertBanner}
            style={{
              backgroundColor: focusOnBanner
                ? userStyle.banner.hoverColor
                : userStyle.themes.color,
            }}
            onMouseOver={() => {
              setFocusOnBanner(true);
            }}
            onMouseLeave={() => {
              setFocusOnBanner(false);
            }}
            onClick={() => {
              jsonData !== undefined ? createModal("") : setSelectType(true);
            }}
          >
            <span
              className={styles.bannerSpan}
              style={{
                color: userStyle.banner.fontColor,
                font: userStyle.banner.font,
              }}
            >
              {" "}
              + Insert Object
            </span>
          </div>
        )}
        <div className={styles.jsonListOutput} ref={jsonListOutput}>
          <JsonView
            key={"DisplayJson"}
            input={jsonData}
            jsonPath={""}
            jsonListOutput={jsonListOutput}
            deleteNode={deleteNode}
            setPrimitive={setPrimitive}
            createModal={createModal}
            expandToGeneration={expandToGeneration}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}
