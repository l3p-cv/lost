import React from 'react'
import { Grid, Image } from 'semantic-ui-react'
import GroupTable from '../components/Users/Groups'
import UserTable from '../components/Users/Users'



function Users() {
    return (
        <Grid columns={2} divided>
            <Grid.Row>
                <Grid.Column width={6}>
                    <GroupTable />
                </Grid.Column>
                <Grid.Column width={10}>
                    <UserTable />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}


export default Users

