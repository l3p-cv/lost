import React from 'react'
import BaseTable from './BaseTable'




const tableData = {
    header: [
        {
            title: "Name",
            key: "name"
        },
        {
            title: "Age",
            key: "age"
        },
        {
            title: "Gender",
            key: "gender"
        },
        {
            title: "City",
            key: "city"
        },
    ],
    data: [
        { name: 'John', age: 15, gender: 'Male' , city: "asd"},
        { name: 'Amber', age: 40, gender: 'Female' , city: "asd"},
        { name: 'Leslie', age: 25, gender: 'Other' , city: "asd"},
        { name: 'Ben', age: 70, gender: 'Male' , city: "asd"},
    ]
}
function UserTable() {
    return (
        <div>
            <BaseTable tableData={tableData} />
        </div>
    )
}

export default UserTable
