import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { FaLock, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const TheHeaderDropdown = () => {
  const username = localStorage.getItem('username')
  const navigate = useNavigate()

  return (
    <CDropdown variant="nav-item" className="c-header-nav-items mx-2" direction="center">
      <CDropdownToggle className="c-header-nav-link" caret={false} variant="ghost">
        <div>
          <span style={{ marginRight: 15 }}>{username}</span>
          <div className="c-avatar" style={{ display: 'inline' }}>
            <img
              alt="user-avatar"
              className="c-avatar-img"
              src="/assets/user.png"
              style={{ width: 40, height: 40 }}
            />
          </div>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownItem disabled color="light" className="text-center">
          <strong>Account</strong>
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/my_profile')}>
          <FaUser style={{ marginRight: 10 }} />
          My Profile
        </CDropdownItem>
        <CDropdownItem
          onClick={() => {
            navigate('/logout')
          }}
        >
          <FaLock style={{ marginRight: 10 }} />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default TheHeaderDropdown
