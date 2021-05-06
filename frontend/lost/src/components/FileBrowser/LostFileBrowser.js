import React, { useEffect, useState } from 'react';
import { setChonkyDefaults, ChonkyActions } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import {
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
} from 'chonky'
import axios from 'axios'
import {API_URL} from '../../lost_settings'

const getPath = async () => {
  let response = await axios.get(API_URL+'/fb/first')
  return response.data
}
const getPath2 = () => {
  axios.get(API_URL+'/fb/first').then( resp => {
    console.log('getPath2 response',resp)
  })
}

const handleFileAction = (data) => {
  console.log(data)
  switch (data.id){
    case ChonkyActions.OpenFiles.id:
      console.log('OpenFiles')
      break
    default:
      console.log('Unknown action', data.id)
  }
}

const LostFileBrowser = ({}) => {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  useEffect(() => {
    setChonkyDefaults({ iconComponent: ChonkyIconFA })
    console.log('getPath', getPath())
    getPath2()
  }, [])
  const files = [
    null, // Loading animation will be shown for this file
    null,
    {
      id: 'nTe',
      name: 'Normal file.yml',
      size: 890,
      modDate: new Date('2012-01-01'),
    },
    {
      id: 'zxc',
      name: 'Hidden file.mp4',
      isHidden: true,
      size: 890,
    },
    {
      id: 'bnm',
      name: 'Normal folder',
      isDir: true,
      childrenCount: 12,
    },
  ]
  const folderChain = [
      { id: 'zxc', name: 'Home' },
      null, // Will show loading placeholder
      { id: 'fgh', name: 'My Documents' },
  ];
  return (
    <FileBrowser defaultFileViewActionId={ChonkyActions.EnableListView.id} 
      files={files} 
      folderChain={folderChain}
      onFileAction={e => {handleFileAction(e)}}>
        <FileNavbar />
        <FileToolbar />
        <FileList />
        <FileContextMenu />
    </FileBrowser>
  );
}

export default LostFileBrowser