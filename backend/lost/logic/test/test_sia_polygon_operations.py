import pytest
import json
import logging
import math
from unittest.mock import MagicMock
from lost.logic import sia
import lostconfig as config
from shapely.errors import TopologicalError, ShapelyError
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union

# Mock flask.current_app.logger to avoid Flask context errors
sia.flask = MagicMock()
sia.flask.current_app.logger = logging.getLogger("test_sia")

# Test data for polygon union operation
UNION_PAYLOAD = {
    "annotations": [
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.36484446035917834, "y": 0.7040169187754073},
                {"x": 0.5309574141076743, "y": 0.7704621002748057},
                {"x": 0.5294472963463243, "y": 0.6541830326508585},
            ],
        },
        {
            "type": "bbox",
            "data": {"x": 0.5483237683631988, "y": 0.6519178560088337, "w": 0.12836, "h": 0.14346118732824645},
        },
    ]
}

EXPECTED_UNION_RESULT = {
    "type": "polygon",
    "resultantPolygon": [
        {"x": 0.5699523241507578, "y": 0.5801872623447104},
        {"x": 0.48414376836319883, "y": 0.5801872623447104},
        {"x": 0.48414376836319883, "y": 0.6678987796549241},
        {"x": 0.36484446035917834, "y": 0.7040169187754073},
        {"x": 0.5309574141076743, "y": 0.7704621002748057},
        {"x": 0.5303494446193385, "y": 0.7236484496729569},
        {"x": 0.6125037683631989, "y": 0.7236484496729569},
        {"x": 0.6125037683631989, "y": 0.6252111450072413},
        {"x": 0.7453941362193689, "y": 0.5907580866741601},
        {"x": 0.7000906033788701, "y": 0.45937784143671334},
        {"x": 0.5445484739598239, "y": 0.4714587835275131},
    ],
}

# Test data for polygon difference operation
DIFFERENCE_PAYLOAD = {
    "selectedPolygon": {
        "type": "bbox",
        "data": {"x": 0.5483237683631988, "y": 0.6519178560088337, "w": 0.12836000971474684, "h": 0.14346118732824645},
    },
    "polygonModifiers": [
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.36484446035917834, "y": 0.7040169187754073},
                {"x": 0.5309574141076743, "y": 0.7704621002748057},
                {"x": 0.5294472963463243, "y": 0.6541830326508585},
            ],
        },
    ],
}

EXPECTED_DIFFERENCE_RESULT = {
    "type": "polygon",
    "resultantPolygon": [
        {"x": 0.48414376350582544, "y": 0.6678987811255049},
        {"x": 0.5294472963463243, "y": 0.6541830326508585},
        {"x": 0.5303494446193385, "y": 0.7236484496729569},
        {"x": 0.6125037732205723, "y": 0.7236484496729569},
        {"x": 0.6125037732205723, "y": 0.6252111437479222},
        {"x": 0.5823014179935729, "y": 0.6330413839919591},
        {"x": 0.5699523241507578, "y": 0.5801872623447104},
        {"x": 0.48414376350582544, "y": 0.5801872623447104},
    ],
}

# Test data for bbox intersection operation
INTERSECTION_BBOX_PAYLOAD = {
    "annotations": [
        {
            "type": "bbox",
            "data": {
                "x": 0.5483237683631988,
                "y": 0.6519178560088337,
                "w": 0.12836000971474684,
                "h": 0.14346118732824645,
            },
        },
        {
            "type": "bbox",
            "data": {
                "x": 0.4350649362619516,
                "y": 0.5477197304756862,
                "w": 0.23406825300924422,
                "h": 0.20990636882764482,
            },
        },
    ]
}

EXPECTED_INTERSECTION_BBOX_RESULT = {
    "type": "bbox",
    "resultantBBox": {
        "x": 0.5181214131361995,
        "y": 0.6164300886171095,
        "w": 0.06795529926074828,
        "h": 0.07248565254479822,
    },
}

INTERSECTION_BBOX_POLYGON_PAYLOAD = {
    "annotations": [
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "bbox",
            "data": {
                "x": 0.5483237683631988,
                "y": 0.6519178560088337,
                "w": 0.12836000971474684,
                "h": 0.14346118732824645,
            },
        },
    ]
}

EXPECTED_INTERSECTION_BBOX_POLYGON_RESULT = {
    "type": "polygon",
    "resultantPolygon": [
        {"x": 0.5823014179935729, "y": 0.6330413839919591},
        {"x": 0.6125037732205723, "y": 0.6252111437479222},
        {"x": 0.6125037732205723, "y": 0.5801872623447104},
        {"x": 0.5699523241507578, "y": 0.5801872623447104},
    ],
}


def compare_polygons(actual, expected, tolerance=1e-6):
    if len(actual) != len(expected):
        return False
    for a, e in zip(actual, expected):
        if not (abs(a["x"] - e["x"]) < tolerance and abs(a["y"] - e["y"]) < tolerance):
            return False
    return True


def compare_bboxes(actual, expected, tolerance=1e-6):
    for key in ["x", "y", "w", "h"]:
        if not abs(actual[key] - expected[key]) < tolerance:
            return False
    return True


class TestPolygonOperations:
    def test_valid_polygon_union_mixed(self):
        """Test valid union operation with mixed polygon and bbox inputs."""
        data = sia.normalize_annotations(UNION_PAYLOAD)
        result = sia.perform_polygon_union(data)
        assert result["type"] == "polygon"
        assert "resultantPolygon" in result
        assert compare_polygons(result["resultantPolygon"], EXPECTED_UNION_RESULT["resultantPolygon"])

    def test_valid_polygon_difference_mixed(self):
        """Test valid difference operation with bbox as selectedPolygon and polygons as modifiers."""
        data = sia.normalize_annotations({
            "annotations": [DIFFERENCE_PAYLOAD["selectedPolygon"]] + DIFFERENCE_PAYLOAD["polygonModifiers"]
        })
        data["selectedPolygon"] = data["annotations"][0]["polygonCoordinates"]
        data["polygonModifiers"] = [ann["polygonCoordinates"] for ann in data["annotations"][1:]]
        result = sia.perform_polygon_difference(data)
        assert result["type"] == "polygon"
        assert "resultantPolygon" in result
        assert compare_polygons(result["resultantPolygon"], EXPECTED_DIFFERENCE_RESULT["resultantPolygon"])

    def test_intersection_bbox_only(self):
        """Test intersection of two bboxes."""
        data = sia.normalize_annotations(INTERSECTION_BBOX_PAYLOAD)
        result = sia.perform_polygon_intersection(data)
        assert result["type"] == "bbox"
        assert "resultantBBox" in result
        assert compare_bboxes(result["resultantBBox"], EXPECTED_INTERSECTION_BBOX_RESULT["resultantBBox"])

    def test_intersection_bbox_and_polygon(self):
        """Test intersection of a bbox and a polygon."""
        data = sia.normalize_annotations(INTERSECTION_BBOX_POLYGON_PAYLOAD)
        result = sia.perform_polygon_intersection(data)
        assert result["type"] == "polygon"
        assert "resultantPolygon" in result
        assert compare_polygons(
            result["resultantPolygon"], EXPECTED_INTERSECTION_BBOX_POLYGON_RESULT["resultantPolygon"]
        )

    def test_union_with_self_intersecting_polygon(self):
        """Test that intersection fails when a self-intersecting polygon is included."""
        bad_request = {
            "annotations": [
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.5445484739598239, "y": 0.4714587835275131},
                        {"x": 0.5823014179935729, "y": 0.6330413839919591},
                        {"x": 0.7453941362193689, "y": 0.5907580866741601},
                        {"x": 0.7000906033788701, "y": 0.45937784143671334},
                    ],
                },
                {
                    "type": "bbox",
                    "data": {
                        "x": 0.5483237683631988,
                        "y": 0.6519178560088337,
                        "w": 0.12836000971474684,
                        "h": 0.14346118732824645,
                    },
                },
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.18005404557306592, "y": 0.1402603911752251},
                        {"x": 0.3311225768379906, "y": 0.1378039922928686},
                        {"x": 0.2611152086908304, "y": 0.22254975373416783},
                        {"x": 0.3679685600733381, "y": 0.2864161246754368},
                        {"x": 0.19602063830838315, "y": 0.2901007229989716},
                        {"x": 0.2611152086908304, "y": 0.22254975373416783},
                    ],
                },
            ]
        }

        data = sia.normalize_annotations(bad_request)
        with pytest.raises(sia.PolygonOperationError) as excinfo:
            sia.perform_polygon_union(data)

        assert "Invalid polygon geometry: Self-intersection" in str(excinfo.value)

    def test_intersection_with_self_intersecting_polygon(self):
        """Test that intersection fails when a self-intersecting polygon is included."""
        bad_request = {
            "annotations": [
                {
                    "type": "bbox",
                    "data": {
                        "x": 0.5483237683631988,
                        "y": 0.6519178560088337,
                        "w": 0.12836000971474684,
                        "h": 0.14346118732824645,
                    },
                },
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.18005404557306592, "y": 0.1402603911752251},
                        {"x": 0.3311225768379906, "y": 0.1378039922928686},
                        {"x": 0.2611152086908304, "y": 0.22254975373416783},
                        {"x": 0.3679685600733381, "y": 0.2864161246754368},
                        {"x": 0.19602063830838315, "y": 0.2901007229989716},
                        {"x": 0.2611152086908304, "y": 0.22254975373416783},
                    ],
                },
            ]
        }

        data = sia.normalize_annotations(bad_request)
        with pytest.raises(sia.PolygonOperationError) as excinfo:
            sia.perform_polygon_intersection(data)

        assert "Invalid polygon geometry: Self-intersection" in str(excinfo.value)

    def test_difference_with_non_overlapping_polygons(self):
        """Test difference operation with non-overlapping polygons."""
        payload = {
            "selectedPolygon": {
                "type": "polygon",
                "data": [
                    {"x": 0.18005404557306592, "y": 0.1402603911752251},
                    {"x": 0.3311225768379906, "y": 0.1378039922928686},
                    {"x": 0.2611152086908304, "y": 0.22254975373416783},
                    {"x": 0.3679685600733381, "y": 0.2864161246754368},
                    {"x": 0.19602063830838315, "y": 0.2901007229989716},
                    {"x": 0.26111711639889107, "y": 0.22254361273696188},
                ],
            },
            "polygonModifiers": [
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.5445484739598239, "y": 0.4714587835275131},
                        {"x": 0.5823014179935729, "y": 0.6330413839919591},
                        {"x": 0.7453941362193689, "y": 0.5907580866741601},
                        {"x": 0.7000906033788701, "y": 0.45937784143671334},
                    ],
                },
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.5445484739598239, "y": 0.4714587835275131},
                        {"x": 0.5823014179935729, "y": 0.6330413839919591},
                        {"x": 0.7453941362193689, "y": 0.5907580866741601},
                        {"x": 0.7000906033788701, "y": 0.45937784143671334},
                    ],
                },
                {
                    "type": "polygon",
                    "data": [
                        {"x": 0.36484446035917834, "y": 0.7040169187754073},
                        {"x": 0.5309574141076743, "y": 0.7704621002748057},
                        {"x": 0.5294472963463243, "y": 0.6541830326508585},
                    ],
                },
            ],
        }
        data = sia.normalize_annotations({"annotations": [payload["selectedPolygon"]] + payload["polygonModifiers"]})
        data["selectedPolygon"] = data["annotations"][0]["polygonCoordinates"]
        data["polygonModifiers"] = [ann["polygonCoordinates"] for ann in data["annotations"][1:]]

        with pytest.raises(sia.PolygonOperationError) as excinfo:
            sia.perform_polygon_difference(data)

        assert "No overlap detected between selected polygon and modifiers" in str(excinfo.value)


def compare_bboxes(actual, expected, tolerance=1e-6):
    for key in ["x", "y", "w", "h"]:
        if not abs(actual[key] - expected[key]) < tolerance:
            return False
    return True


def test_compute_bboxes_from_points_valid():
    """Test bounding box computation from a valid point set with 8 points."""
    payload = {
        "data": [
            [
                {"x": 0.20201015188684168, "y": 0.5913626320093255},
                {"x": 0.0843630930633123, "y": 0.5913626320093255},
                {"x": 0.0843630930633123, "y": 0.6749090940724116},
                {"x": 0.15216530090296987, "y": 0.6749090940724116},
                {"x": 0.15216530090296987, "y": 0.8067954138177009},
                {"x": 0.3521653009029699, "y": 0.8067954138177009},
                {"x": 0.3521653009029699, "y": 0.619105729248221},
                {"x": 0.20201015188684168, "y": 0.619105729248221},
            ]
        ]
    }

    expected_bbox = {"x": 0.2182642, "y": 0.69907902, "w": 0.26780221, "h": 0.26780221}

    result = sia.compute_bboxes_from_points(payload)

    assert isinstance(result, list)
    assert len(result) == 1

    bbox = result[0]
    assert set(bbox.keys()) == {"x", "y", "w", "h"}
    assert compare_bboxes(bbox, expected_bbox), f"BBox mismatch: {bbox} != {expected_bbox}"


def test_compute_bboxes_from_points_insufficient_points():
    """Test that compute_bboxes_from_points raises error for point sets with fewer than 3 points."""
    payload = {
        "data": [
            [{"x": 0.43413780496681637, "y": 0.4264308609697573}, {"x": 0.5142778185036971, "y": 0.4460820520286093}]
        ]
    }

    with pytest.raises(sia.PolygonOperationError) as excinfo:
        sia.compute_bboxes_from_points(payload)

    assert "Each point set must contain at least 3 points" in str(excinfo.value)
