import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import state from '../store'
import config from '../config/config'
import { download } from '../assets'
import { downloadCanvasToImage, reader } from '../config/helpers'
import { EditorTabs, DecalTypes, FilterTabs } from '../config/constants'
import { fadeAnimation, slideAnimation } from '../config/motion'
import { AIPicker, ColorPicker, FilePicker, Tab, CustomButton } from '../components'

const Customizer = () => {
  const snap = useSnapshot(state)

  const [file, setFile] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatingImg, setGeneratingImg] = useState(false)
  const [activeEditorTab, setActiveEditorTab] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })

  // show tab content depending on the active tab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "aipicker":
        return <AIPicker />
          
      default:
        return null;
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type]
    state[decalType.stateProperty] = result

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName]
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName]
      default:
        state.isLogoTexture = true
        state.isFullTexture = false
    }
  }

  // const readFile = (type) => {
  //   reader(file)
  //     .then((result) => {
  //       handleDecals(type, result)
  //       setActiveEditorTab("")
  //     })
  // }

  const readFile = (type) => {
    if (!(file instanceof Blob)) {
      // Convert non-Blob files to Blob before reading
      const blobFile = new Blob([file]);
      reader(blobFile)
        .then((result) => {
          handleDecals(type, result);
          setActiveEditorTab("");
        })
        .catch((error) => {
          console.error("Error reading file:", error);
          // Handle error if occurred during file reading
          alert("Error reading file. Please try again.");
        });
    } else {
      // File is already a Blob, proceed with reading
      reader(file)
        .then((result) => {
          handleDecals(type, result);
          setActiveEditorTab("");
        })
        .catch((error) => {
          console.error("Error reading file:", error);
          // Handle error if occurred during file reading
          alert("Error reading file. Please try again.");
        });
    }
  };


    return (
      <AnimatePresence>
        {!snap.intro && (
          <>
            <motion.div
              key="custom"
              className="absolute top-0 left-0 z-10"
              {...slideAnimation("left")}>
              <div className="flex items-center min-h-screen">
                <div className="editortabs-container tabs">
                  {EditorTabs.map((tab) => (
                    <Tab key={tab.name} tab={tab} handleClick={() => {setActiveEditorTab(tab.name)}} />
                  ))}

                  {generateTabContent()}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute z-10 top-5 right-5"
              {...fadeAnimation}>
              <CustomButton
                type="filled"
                title="Go Back"
                handleClick={() => (state.intro = true)}
                customStyles="w-fit px-4 py-2.5 font-bold text-sm"
              />
            </motion.div>

            <motion.div
              className="filtertabs-container"
              {...slideAnimation('up')}
            >
              {FilterTabs.map((tab) => (
                <Tab 
                  key={tab.name}
                  tab={tab}
                  isFilterTab
                  isActiveTab=""
                  handleClick={() => {}}
                />
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
}

export default Customizer