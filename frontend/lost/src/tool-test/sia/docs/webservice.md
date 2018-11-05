GET: /sia/api/configuration
```json
{
    "tools": {
        "point": "[boolean]",
        "line": "[boolean]",
        "polygon": "[boolean]",
        "bbox": "[boolean]"
    },
    "actions": {
        "drawing": "[boolean]",
        // labeling can be completely deactivated.
        "labeling": "[boolean]",
        // labeling, changing bounds and deleting for 
        // previously created drawables (different annotation "session")
        // can be set independently.
        "edit": {
            "label": "[boolean]",  // unfinished
            "bounds": "[boolean]",
            "delete": "[boolean]",
        },
    },
    "drawables": {
        "bbox": {
            "minArea": "[float]",
            "minAreaType": "rel|abs",
        }
    }
}
```

GET: /sia/api/label-trees
```json
{
    "labelTrees":
    [
        "id": "[integer]",
        "name": "[string]",
        "description": "[string]",
        "cssClass": "[string]",
        "labelLeaves": [
            {
                "id": "[integer]",
                "name": "[string]",
                "description": "[string]",
                "cssClass": "[string]",
            }
        ],
    ]
}
```

GET: /sia/api/first/\[integer\] (last image id)
GET: /sia/api/next/\[integer\] (last image id) 
GET: /sia/api/prev/\[integer\] (last image id)
```json
{
    "image": {
        "id" : "[integer]",
        "url": "[string]",
        "number": "[integer]",
        "amount": "[integer]",
        "isFirst": "[boolean]",
        "isLast": "[boolean]"
    },
    "drawables": {
        "bBoxes": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "data": {
                    "x": "[float]",
                    "y": "[float]",
                    "w": "[float]",
                    "h": "[float]",
                }
            },
        ],
        "points": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "data": {
                    "x": "[float]",
                    "y": "[float]",
                }
            },
        ],
        "lines": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "data": [
                    {
                        "x": "[float]",
                        "y": "[float]",
                    },
                ]
            },
        ],
        "polygons": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "data": [
                    {
                        "x": "[float]",
                        "y": "[float]",
                    },
                ]
            },
        ],
    }
}
```

POST: /sia/api/update
```json
{
    "imgId" : "[integer]",
    "drawables": {
        "bBoxes": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "status": "[string]",
                "data": {
                    "x": "[float]",
                    "y": "[float]",
                    "w": "[float]",
                    "h": "[float]",
                }
            },
        ],
        "points": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "status": "[string]",
                "data": {
                    "x": "[float]",
                    "y": "[float]",
                }
            },
        ],
        "lines": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "status": "[string]",
                "data": [
                    {
                        "x": "[float]",
                        "y": "[float]",
                    },
                ]
            },
        ],
        "polygons": [
            {
                "id": "[integer]",
                "labelIds": "[array of integers]",
                "status": "[string]",
                "data": [
                    {
                        "x": "[float]",
                        "y": "[float]",
                    },
                ]
            },
        ],
    }
}
```

POST: /sia/api/finish/
```json
{

}
```

DELETE: /sia/api/junk/\[integer\] (last image id)
```
```