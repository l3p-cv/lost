## Simple Pipe Example
```json
{
    "name": "TestPipe",
    "description": "a simple test pipe",
    "author": "Test User",
    "elements": [
        {
            "peN": 0,
            "peOut": [1],
            "datasource": {
                "type": "dataset",
            }
        },
        {
            "peN": 1,
            "peOut": [2],
            "script": {
                "name": "TestScript",
                "description": "a test script",
                "path": "/path/to/testscript.py",
                "language": "python3",
                "arguments": {
                    "argumentName": "argumentValue"
                },
                "envs": ["containerOne", "containerTwo"]
            }
        },
        {
            "peN": 2,
            "peOut": null,
            "annoTask": {
                "name": "TestAnnoTask",
                "type": "sia",
                "instructions": "testme",
                "configuration":{
                     "tools" : ["bbox", "polygon", "line", "point"],
                     "actions" : ["label", "draw", "delete", "edit"]
                }
            }
        }
    ]
}
```

## Possible Elements
```json
{
    "elements": [
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "datasource": {
                "type": "[string]",
            }
        },
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "script": {
                "id": "[integer]",
                "name": "[string]",
                "description": "[string]",
                "path": "[string]",
                "language": "[string]",
                "arguments": "[array of object]",
                "envs": "[array of strings]"
            }
        },
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "annoTask": {
                "name": "[string]",
                "type": "[string]",
                "instructions": "[string]",
                "configuration": "[string]",
            }
        },
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "dataExport": ""
        },
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "visualOutput": ""
        },
        {
            "peN": "[integer]",
            "peOut": "[array of integers]",
            "loop": {
                "maxIteration": "[integer]",
                "peJumpId": "[integer]"
            }
        },
    ]}
```