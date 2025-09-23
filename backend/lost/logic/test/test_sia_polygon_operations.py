import pytest
import json
import logging
from unittest.mock import MagicMock
from lost.logic import sia
import lostconfig as config
from shapely.errors import TopologicalError

# Mock flask.current_app.logger to avoid Flask context errors
sia.flask = MagicMock()
sia.flask.current_app.logger = logging.getLogger("test_sia")

# Test data (same as original)
UNION_PAYLOAD = {
            "polygons": [
                [
                    {"x": 0.6185109364844247, "y": 0.6273891953328131},
                    {"x": 0.6733675271715382, "y": 0.6135887951599543},
                    {"x": 0.6723324971585739, "y": 0.572187594641378},
                    {"x": 0.7582399882346197, "y": 0.5501069543648041},
                    {"x": 0.7685902883642638, "y": 0.5777077547105216},
                    {"x": 0.7934310086754096, "y": 0.5680474745895204},
                    {"x": 0.7975711287272672, "y": 0.5473468743302323},
                    {"x": 0.8379372992328792, "y": 0.5266462740709441},
                    {"x": 0.6412815967696416, "y": 0.4590243132239361},
                    {"x": 0.42392529404711604, "y": 0.5142259139153712},
                ],
                [
                    {"x": 0.525358235317628, "y": 0.7005313162489647},
                    {"x": 0.5884950661084568, "y": 0.7198518764909669},
                    {"x": 0.6806127372622891, "y": 0.6881109560933918},
                    {"x": 0.7758354984550146, "y": 0.6356694354365284},
                    {"x": 0.8358672392069503, "y": 0.6135887951599543},
                    {"x": 0.8462175393365944, "y": 0.6467097555748155},
                    {"x": 0.604020516302923, "y": 0.7736734371651162},
                    {"x": 0.5274282953435568, "y": 0.7295121566119681},
                    {"x": 0.5263932653305924, "y": 0.7295121566119681},
                ],
                [
                    {"x": 0.665087287067823, "y": 0.5680474745895204},
                    {"x": 0.6764726172104315, "y": 0.7364123566983974},
                    {"x": 0.6247211165622111, "y": 0.6577500757131024},
                ],
                [
                    {"x": 0.7540998681827621, "y": 0.5252662340536582},
                    {"x": 0.7696253183772283, "y": 0.7005313162489647},
                    {"x": 0.799641188753196, "y": 0.5970283149525238},
                ],
                [
                    {"x": 0.6568070469641077, "y": 0.5528670343993758},
                    {"x": 0.7623801082864774, "y": 0.5197460739845148},
                    {"x": 0.7799756185068722, "y": 0.6908710361279635},
                    {"x": 0.6764726172104315, "y": 0.7226119565255387},
                ],
            ]
        }
EXPECTED_UNION_RESULT = [
            {"x": 0.7696253183772283, "y": 0.7005313162489647},
            {"x": 0.7716899252961079, "y": 0.6934119820459312},
            {"x": 0.7799756185068722, "y": 0.6908710361279635},
            {"x": 0.7790549901107757, "y": 0.6819174736874953},
            {"x": 0.8462175393365944, "y": 0.6467097555748155},
            {"x": 0.8358672392069503, "y": 0.6135887951599543},
            {"x": 0.7899397134077983, "y": 0.630481678212516},
            {"x": 0.799641188753196, "y": 0.5970283149525238},
            {"x": 0.7836607510723111, "y": 0.5718470192129477},
            {"x": 0.7934310086754096, "y": 0.5680474745895204},
            {"x": 0.7975711287272672, "y": 0.5473468743302323},
            {"x": 0.8379372992328792, "y": 0.5266462740709441},
            {"x": 0.6412815967696416, "y": 0.4590243132239361},
            {"x": 0.42392529404711604, "y": 0.5142259139153712},
            {"x": 0.6185109364844247, "y": 0.6273891953328131},
            {"x": 0.6409204373608626, "y": 0.6217515850494325},
            {"x": 0.6247211165622111, "y": 0.6577500757131024},
            {"x": 0.6513328475720626, "y": 0.6981999068480766},
            {"x": 0.5884950661084568, "y": 0.7198518764909669},
            {"x": 0.525358235317628, "y": 0.7005313162489647},
            {"x": 0.5263932653305924, "y": 0.7295121566119681},
            {"x": 0.5274282953435568, "y": 0.7295121566119681},
            {"x": 0.604020516302923, "y": 0.7736734371651162},
            {"x": 0.6761206446895773, "y": 0.7358773584666991},
            {"x": 0.6764726172104315, "y": 0.7364123566983974},
            {"x": 0.676425627688192, "y": 0.7357174813392201},
            {"x": 0.7366008667849485, "y": 0.7041726266560201},
            {"x": 0.7690659499148749, "y": 0.6942166678295093},
        ]
INTERSECTION_PAYLOAD = {
            "polygons": [
                [
                    {"x": 0.20175174213338237, "y": 0.7281788029570068},
                    {"x": 0.19571127108798253, "y": 0.5832074978674103},
                    {"x": 0.14889762048613367, "y": 0.5560253781631109},
                    {"x": 0.07792208570268543, "y": 0.5696164380152606},
                    {"x": 0.026578081816786694, "y": 0.7417698628091564},
                ],
                [
                    {"x": 0.12322561854318431, "y": 0.6617336214576084},
                    {"x": 0.1443672672020838, "y": 0.8097251620699047},
                    {"x": 0.2893385722916802, "y": 0.7251585674343068},
                ],
            ]
        }
EXPECTED_INTERSECTION_RESULT = [
            {"x": 0.20020791119645184, "y": 0.6911268604706742},
            {"x": 0.12322561854318431, "y": 0.6617336214576084},
            {"x": 0.13347455419025128, "y": 0.7334761709870773},
            {"x": 0.20175174213338237, "y": 0.7281788029570068},
        ]
DIFFERENCE_PAYLOAD = {
            "selectedPolygon": [
                {"x": 0, "y": 0.9958598799481424},
                {"x": 1, "y": 0.9930997999135707},
                {"x": 1, "y": 0.0008510274850248938},
                {"x": 0, "y": 0.002231067502310771},
            ],
            "polygonModifiers": [
                [
                    {"x": 0, "y": 0.6146597062133682},
                    {"x": 0.4535942223627377, "y": 0.5112163226456742},
                    {"x": 0.6096071943008989, "y": 0.5123468514278346},
                    {"x": 1, "y": 0.5954407169166381},
                    {"x": 1, "y": 0.9972399199654283},
                    {"x": 0, "y": 0.9986199599827141},
                ],
                [
                    {"x": 0, "y": 0.280999150994058},
                    {"x": 0.24952273686261336, "y": 0.22579755030262288},
                    {"x": 0.5600317407519356, "y": 0.2368378704409099},
                    {"x": 0.8167191839671087, "y": 0.22303747026805112},
                    {"x": 0.8829611047968308, "y": 0.23269775038905227},
                    {"x": 1, "y": 0.23269775038905227},
                    {"x": 0.9988844662488444, "y": 0.002231067502310771},
                    {"x": 0.009395773854870802, "y": 0.0008510274850248938},
                ],
            ],
        }
EXPECTED_DIFFERENCE_RESULT = [
            {"x": 0.0, "y": 0.6146597062133682},
            {"x": 0.4535942223627377, "y": 0.5112163226456742},
            {"x": 0.6096071943008989, "y": 0.5123468514278346},
            {"x": 1.0, "y": 0.5954407169166381},
            {"x": 1.0, "y": 0.23269775038905227},
            {"x": 0.8829611047968308, "y": 0.23269775038905227},
            {"x": 0.8167191839671087, "y": 0.22303747026805112},
            {"x": 0.5600317407519356, "y": 0.2368378704409099},
            {"x": 0.24952273686261336, "y": 0.22579755030262288},
            {"x": 0.0, "y": 0.280999150994058},
        ]

def compare_polygons(actual, expected, tolerance=1e-6):
    if len(actual) != len(expected):
        return False
    for a, e in zip(actual, expected):
        if not (abs(a["x"] - e["x"]) < tolerance and abs(a["y"] - e["y"]) < tolerance):
            return False
    return True

class TestPolygonOperations:
    def test_tc01_valid_operations(self):
        """Test TC01: Valid union, intersection, difference operations."""
        # Union
        result = sia.perform_polygon_union(UNION_PAYLOAD)
        assert "resultantPolygon" in result, "Union response missing resultantPolygon"
        assert compare_polygons(
            result["resultantPolygon"], EXPECTED_UNION_RESULT
        ), f"Union resultantPolygon mismatch: {result['resultantPolygon']}"

        # Intersection
        result = sia.perform_polygon_intersection(INTERSECTION_PAYLOAD)
        assert "resultantPolygon" in result, "Intersection response missing resultantPolygon"
        assert compare_polygons(
            result["resultantPolygon"], EXPECTED_INTERSECTION_RESULT
        ), f"Intersection resultantPolygon mismatch: {result['resultantPolygon']}"

        # Difference
        result = sia.perform_polygon_difference(DIFFERENCE_PAYLOAD)
        assert "resultantPolygon" in result, "Difference response missing resultantPolygon"
        assert compare_polygons(
            result["resultantPolygon"], EXPECTED_DIFFERENCE_RESULT
        ), f"Difference resultantPolygon mismatch: {result['resultantPolygon']}"

    def test_tc02_missing_required_field(self):
        """Test TC02: Missing required field (polygons)."""
        payload = {"polygon": INTERSECTION_PAYLOAD["polygons"]}
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_intersection(payload)
        assert str(exc_info.value) == "Missing or invalid 'polygons' field"

    def test_tc03_invalid_polygon_count(self):
        """Test TC03: Invalid polygon count (only 1 polygon)."""
        payload = {"polygons": [INTERSECTION_PAYLOAD["polygons"][0]]}
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_intersection(payload)
        assert str(exc_info.value) == "Exactly 2 polygons required for intersection"

    def test_tc04_missing_modifier_polygons(self):
        """Test TC04: Missing polygonModifiers for difference."""
        payload = {"selectedPolygon": DIFFERENCE_PAYLOAD["selectedPolygon"]}
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_difference(payload)
        assert str(exc_info.value) == "Missing 'selectedPolygon' or 'polygonModifiers' field"

    def test_tc05_empty_result(self):
        """Test TC05: Non-overlapping polygons for intersection."""
        payload = {
            "polygons": [
                [
                    {"x": 0.21203164972634694, "y": 0.2768590309422003},
                    {"x": 0.14394967554024368, "y": 0.5211261140018006},
                    {"x": 0.7732479234226037, "y": 0.5100857938635136},
                    {"x": 0.810048990550227, "y": 0.27547899092491446},
                ],
                [
                    {"x": 0.17707063595510472, "y": 0.6025484750216673},
                    {"x": 0.20099132958805993, "y": 0.7474526768366845},
                    {"x": 0.8321296308268011, "y": 0.7502127568712562},
                    {"x": 0.8266094707576576, "y": 0.6122087551426685},
                ],
            ]
        }
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_intersection(payload)
        assert str(exc_info.value) == "Intersection resulted in an empty polygon"

    def test_tc06_invalid_geometry(self):
        """Test TC06: Polygon with <3 vertices."""
        payload = {
            "polygons": [
                [
                    {"x": 0.21203164972634694, "y": 0.2768590309422003},
                    {"x": 0.14394967554024368, "y": 0.5211261140018006},
                    {"x": 0.7732479234226037, "y": 0.5100857938635136},
                    {"x": 0.810048990550227, "y": 0.27547899092491446},
                ],
                [
                    {"x": 0.17707063595510472, "y": 0.6025484750216673},
                    {"x": 0.20099132958805993, "y": 0.7474526768366845},
                ],
            ]
        }
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_intersection(payload)
        assert str(exc_info.value) == "Each polygon must have at least 3 vertices"

    def test_tc07_multipolygon_result(self):
        """Test TC07: Intersection producing MultiPolygon."""
        payload = {
            "polygons": [
                [
                    {"x": 0.4523886194036372, "y": 0.7598730369922574},
                    {"x": 0.5600317407519356, "y": 0.764013157044115},
                    {"x": 0.5972928212186543, "y": 0.6770706359551047},
                    {"x": 0.5462313405790769, "y": 0.5307863941228017},
                    {"x": 0.46756905959378187, "y": 0.4562642331893644},
                    {"x": 0.3530257381590541, "y": 0.5473468743302323},
                    {"x": 0.3408698842696117, "y": 0.6798307159896765},
                    {"x": 0.3488856181071964, "y": 0.7433125567848269},
                ],
                [
                    {"x": 0.15568001568717363, "y": 0.5514869943820899},
                    {"x": 0.27712353720833083, "y": 0.471444673379509},
                    {"x": 0.38338661853934336, "y": 0.5087057538462277},
                    {"x": 0.5048301400605005, "y": 0.5942682349179521},
                    {"x": 0.2053614563094652, "y": 0.6660303158168177},
                    {"x": 0.29506405743304726, "y": 0.7419325167675409},
                    {"x": 0.533810980423504, "y": 0.674310555920533},
                    {"x": 0.2812636572601885, "y": 0.8399153579948383},
                    {"x": 0.1391195354797431, "y": 0.7709133571305444},
                ],
            ]
        }
        expected_result = [
            {"x": 0.3530257381590541, "y": 0.5473468743302323},
            {"x": 0.3452109921519456, "y": 0.6325179846471911},
            {"x": 0.5048301400605005, "y": 0.5942682349179521},
            {"x": 0.39305420579207745, "y": 0.5155170085015631},
        ]
        result = sia.perform_polygon_intersection(payload)
        assert "resultantPolygon" in result
        assert compare_polygons(
            result["resultantPolygon"], expected_result
        ), f"MultiPolygon resultantPolygon mismatch: {result['resultantPolygon']}"

    def test_tc08_invalid_coordinates(self):
        """Test TC09: Invalid coordinate values."""
        payload = {
            "polygons": [
                [
                    {"x": "invalid", "y": 0.7281788029570068},
                    {"x": 0.19571127108798253, "y": 0.5832074978674103},
                    {"x": 0.14889762048613367, "y": 0.5560253781631109},
                    {"x": 0.07792208570268543, "y": 0.5696164380152606},
                ],
                [
                    {"x": 0.12322561854318431, "y": 0.6617336214576084},
                    {"x": 0.1443672672020838, "y": 0.8097251620699047},
                    {"x": 0.2893385722916802, "y": 0.7251585674343068},
                    {"x": 0.12322561854318431, "y": 0.6617336214576084},
                ],
            ]
        }
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_intersection(payload)
        assert str(exc_info.value) == "All coordinates must be numeric"

    def test_tc09_self_intersecting_polygon(self):
        """Test TC10: Self-intersecting polygon."""
        payload = {
            "polygons": [
                [
                    {"x": 0.1385061843609494, "y": 0.6232490752809555},
                    {"x": 0.26577654151064695, "y": 0.8274949978392654},
                    {"x": 0.18904073836806395, "y": 0.5833325485041403},
                    {"x": 0.31407794211565265, "y": 0.6218690352636697},
                    {"x": 0.20290805183429034, "y": 0.40934287260164454},
                    {"x": 0.18904073836806395, "y": 0.5833325485041403},
                ],
                [
                    {"x": 0.271143363800092, "y": 0.4838650335350819},
                    {"x": 0.28341038617596653, "y": 0.595648274935238},
                    {"x": 0.4060806099347111, "y": 0.5528670343993758},
                    {"x": 0.32097814220208204, "y": 0.4107229126189304},
                ],
            ]
        }
        with pytest.raises(sia.PolygonOperationError) as exc_info:
            sia.perform_polygon_union(payload)
        assert str(exc_info.value) == "Invalid polygon geometry: Self-intersection"