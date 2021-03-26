import React from 'react'
import { Grid } from 'semantic-ui-react'
import GroupTable from './GroupsTable'
import UserTable from './UsersTable'



function Users() {
    return (
        <Grid columns={2} divided style={{backgroundColor: 'white', padding: 15}}>
            <Grid.Row>
                <Grid.Column width={5}>
                    <GroupTable />
                </Grid.Column>
                <Grid.Column width={11}>
                    <UserTable />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}


export default Users

