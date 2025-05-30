import { CContainer } from '@coreui/react';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useTemplates } from '../../actions/pipeline/pipeline_api';
import BaseContainer from '../../components/BaseContainer';
import { CenteredSpinner } from '../../components/CenteredSpinner';
import Datatable from '../../components/Datatable';
import HelpButton from '../../components/HelpButton';
import { useEffect, useState } from 'react';
import IconButton from '../../components/IconButton';

const TourStartTable = ({ onStartTour }) => {
  const { data, isLoading, isError } = useTemplates('all');
  const [siaPipeline, setSiaPipeline] = useState(null);

  useEffect(() => {
    if (data?.templates) {
      const template = data.templates.find(t => t.name === 'found.sia');
      if (template) {
        localStorage.setItem('siaPipelineId', template.id);
        setSiaPipeline(template);
      }
    }
  }, [data]);

  if (isLoading) return <CenteredSpinner />;
  if (isError || !siaPipeline) return <div>Error loading SIA pipeline</div>;

  return (
    <CContainer style={{ marginTop: '15px' }}>
      <BaseContainer>
        <Datatable
          columns={[
            {
              Header: 'Name / Project',
              accessor: 'name',
              Cell: () => (
                <>
                  <b>SIA</b>
                  <div className="small text-muted">found</div>
                </>
              ),
            },
            {
              Header: 'Description',
              accessor: 'description',
              Cell: () => (
                <HelpButton
                  id="sia-description"
                  text={siaPipeline.description}
                />
              ),
            },
            {
              Header: 'Start Tour',
              accessor: 'id',
              Cell: () => (
                <IconButton
                  icon={faPlay}
                  text="Start Tour"
                  color="primary"
                  onClick={onStartTour}
                />
              ),
            },
          ]}
          data={[siaPipeline]}
          defaultPageSize={1}
        />
      </BaseContainer>
    </CContainer>
  );
};

export default TourStartTable;