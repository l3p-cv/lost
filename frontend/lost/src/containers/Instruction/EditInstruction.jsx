import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

import { CButton, CFormInput } from '@coreui/react';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

import * as fbAPI from '../../actions/fb/fb_api';
import * as Notification from '../../components/Notification';
import { useOwnUser } from '../../actions/user/user_api';

import IconButton from '../../components/IconButton';
import ImageBrowserModal from '../../components/FileBrowser/ImageBrowserModal';
import { API_URL } from '../../lost_settings';
import { getImageMarkdown } from '../../containers/InstructionMedia/media_api';

const mdParser = new MarkdownIt();

const EditInstruction = ({ instructionData, onSave, visLevel, onClose }) => {
  const [option, setOption] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [fs, setFs] = useState();

  const navigate = useNavigate();
  const { data: ownUser } = useOwnUser();

  const { mutateAsync: getFullFs, data: fullFs, isLoading: fsLoading } = fbAPI.useGetFullFs();
  const { mutateAsync: mkDir } = fbAPI.useMkDir();
  const { mutateAsync: getFSListNew } = fbAPI.useGetFSList();

  useEffect(() => {
    setOption(instructionData?.option || '');
    setDescription(instructionData?.description || '');
    setContent(instructionData?.instruction || '');
  }, [instructionData]);

  const handleEditorChange = ({ text }) => setContent(text);

  const handleBrowseClick = async () => {
    try {
      const fsVisLevel = !instructionData.group_id && visLevel === 'global' ? 'all' : visLevel;
      const fsListResponse = await getFSListNew(fsVisLevel);
      const fsGroupId = instructionData.group_id || ownUser?.idx;

      let fs = fsListResponse
        ?.filter(f => f.groupId === fsGroupId)
        ?.reduce((best, current) =>
          current.rootPath.length > (best?.rootPath.length || 0) ? current : best,
        null);

      if (!fs) throw new Error('No matching filesystem found.');

      const fullFsResult = await getFullFs({ id: fs.id });
      fs = {
        ...fs,
        ...fullFsResult,
        permission: fullFsResult?.permission || 'rw',
      };

      setFs(fs);

      const basePath = fs.rootPath;
      const instructionMediaPath = `${basePath}/instruction_media`;
      const groupPath = `${instructionMediaPath}/admin_media`;

      const ensureDir = async (fs, path, name) => {
        if (!await fbAPI.checkIfPathExists(fs, path)) {
          await mkDir({ fs, path, name });
        }
      };

      await ensureDir(fs, basePath, 'instruction_media');

      if (visLevel === 'global') {
        await ensureDir(fs, instructionMediaPath, 'admin_media');
        setSelectedPath(groupPath);
      } else {
        setSelectedPath(instructionMediaPath);
      }
      setBrowseOpen(true);
    } catch (err) {
      console.error('Browse error:', err);
      Notification.showError('Failed to open file browser.');
    }
  };

  const handlePathSelection = async (newPath) => {
    setSelectedPath(newPath);
    Notification.showInfo(`Selected path: ${newPath}`);

    const ext = newPath.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];

    if (imageExtensions.includes(ext)) {
      try {
        const groupId = instructionData.group_id || ownUser?.idx;
        const relativePath = newPath.replace(`${fs.rootPath}/instruction_media/`, '');
        const encodedPath = encodeURIComponent(`${groupId}/instruction_media/${relativePath}`);
        try {
          const markdown = await getImageMarkdown(encodedPath);
          setContent(prev => `${prev}\n${markdown}`);
          setBrowseOpen(false);
        } catch (err) {
          Notification.showError('Could not insert image markdown.');
        }
        
      } catch (error) {
        console.error('Error selecting the file:', error);
        Notification.showError('Error inserting image. Please try again.');
      }
    } else {
      Notification.showError('Selected file is not an image.');
    }
  };

  const handleSave = () => {
    if (!option.trim()) return alert('Annotation option cannot be empty.');
    if (!description.trim()) return alert('Description cannot be empty.');

    onSave({
      id: instructionData.id,
      option,
      description,
      instruction: content,
    });

    visLevel !== 'global' ? navigate('/instruction') : onClose();
  };

  return (
    <div>
      <CFormInput
        label="Annotation Option"
        value={option}
        onChange={(e) => setOption(e.target.value)}
        placeholder="Enter annotation option"
        className="mb-3"
      />
      <CFormInput
        label="Description"
        value={description}
        onChange={(e) => {
          const wordCount = e.target.value.trim().split(/\s+/).length;
          if (wordCount <= 20) setDescription(e.target.value);
          else alert('Description cannot exceed 20 words.');
        }}
        placeholder="Enter description (max 20 words)"
        className="mb-3"
      />
      <MdEditor
        value={content}
        style={{ height: '400px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
        config={{
          view: {
            menu: true,
            toolbar: {
              image: true,
            },
          },
        }}
      />
      <div className="mt-3 d-flex justify-content-between align-items-center">
        <CButton color="primary" onClick={handleSave}>
          Save
        </CButton>
        <IconButton
          icon={faFolderOpen}
          color="info"
          text="Browse Files"
          onClick={handleBrowseClick}
        />
      </div>

      <ImageBrowserModal
        visible={browseOpen}
        onClose={() => setBrowseOpen(false)}
        fs={fs}
        fsLoading={fsLoading}
        fullFs={visLevel === 'global' ? fs : fullFs}
        initPath={selectedPath}
        onPathSelected={handlePathSelection}
      />
    </div>
  );
};

export default EditInstruction;