import pytest
from skimage.metrics import structural_similarity as ssim
import os
import cv2
import math
import numpy as np
from lost.logic import sia

@pytest.fixture
def image_data():
    test_dir = os.path.dirname(__file__)
    file_path = os.path.join(test_dir, "test_filter_images", "original_image_405.png")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Original test image not found: {file_path}")
    img = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Failed to load original image: {file_path}")
    return img

def load_image(filename):
    test_dir = os.path.dirname(__file__)
    file_path = os.path.join(test_dir, filename)
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Image not found: {file_path}")
    img = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Failed to load image: {file_path}")
    return img


class TestImageFilters:
    def test_tc01_canny_missing_lower_threshold(self, image_data):
        config = {"upperThreshold": 150}
        with pytest.raises(ValueError, match="Both lowerThreshold and upperThreshold are required"):
            sia.apply_canny_edge(image_data, config=config)

    def test_tc02_canny_missing_upper_threshold(self, image_data):
        config = {"lowerThreshold": 50}
        with pytest.raises(ValueError, match="Both lowerThreshold and upperThreshold are required"):
            sia.apply_canny_edge(image_data, config=config)

    def test_tc03_canny_thresholds_out_of_range(self, image_data):
        config = {"lowerThreshold": -1, "upperThreshold": 300}
        with pytest.raises(ValueError, match="Threshold values must be between 0 and 255"):
            sia.apply_canny_edge(image_data, config=config)

    def test_tc04_canny_upper_not_greater_than_lower(self, image_data):
        config = {"lowerThreshold": 200, "upperThreshold": 100}
        with pytest.raises(ValueError, match="upperThreshold must be greater than lowerThreshold"):
            sia.apply_canny_edge(image_data, config=config)

    def test_tc05_canny_non_numeric_threshold(self, image_data):
        config = {"lowerThreshold": "a", "upperThreshold": 100}
        with pytest.raises(ValueError, match="Threshold values must be numeric and finite"):
            sia.apply_canny_edge(image_data, config=config)

    def test_tc06_clahe_missing_clip_limit(self, image_data):
        config = {}
        with pytest.raises(ValueError, match="clipLimit is required"):
            sia.apply_clahe(image_data, config=config)

    def test_tc07_clahe_invalid_clip_limit(self, image_data):
        config = {"clipLimit": -1}
        with pytest.raises(ValueError, match="clipLimit must be a positive finite number"):
            sia.apply_clahe(image_data, config=config)

    def test_tc08_apply_filters_unsupported_filter(self, image_data):
        filters = [{"name": "unknown", "configuration": {}}]
        with pytest.raises(ValueError, match="Unsupported filter"):
            sia.apply_filters(image_data, filters=filters)

    def test_tc09_apply_filters_duplicate_filter(self, image_data):
        filters = [
            {"name": "cannyEdge", "configuration": {"lowerThreshold": 50, "upperThreshold": 150}},
            {"name": "clahe", "configuration": {"clipLimit": 2.0}},
            {"name": "cannyEdge", "configuration": {"lowerThreshold": 60, "upperThreshold": 160}},
        ]
        with pytest.raises(ValueError, match="cannot be applied more than once"):
            sia.apply_filters(image_data, filters)

    def test_tc10_apply_filters_canny(self, image_data):
        filters = [{"name": "cannyEdge", "configuration": {"lowerThreshold": 50, "upperThreshold": 150}}]
        processed_img = sia.apply_filters(image_data, filters)
        expected_img = load_image("test_filter_images/test_tc10_image_405.png")
        assert processed_img is not None
        assert processed_img.shape == expected_img.shape, "Shape mismatch between processed and expected image"

        similarity, _ = ssim(processed_img, expected_img, multichannel=True, full=True)
        assert similarity > 0.98, f"Images differ: SSIM={similarity:.2f}"

    def test_tc11_apply_filters_clahe(self, image_data):
        filters = [{"name": "clahe", "configuration": {"clipLimit": 2.0}}]
        processed_img = sia.apply_filters(image_data, filters)
        expected_img = load_image("test_filter_images/test_tc11_image_405.png")
        assert processed_img is not None
        assert processed_img.shape == expected_img.shape, "Shape mismatch between processed and expected image"

        similarity, _ = ssim(processed_img, expected_img, multichannel=True, full=True)
        assert similarity > 0.99, f"Images differ: SSIM={similarity:.2f}"


    def test_tc13_apply_multiple_filters_expected_result(self, image_data):
        filters = [
            {"name": "cannyEdge", "configuration": {"lowerThreshold": 60, "upperThreshold": 180}},
            {"name": "clahe", "configuration": {"clipLimit": 3.0}},
        ]
        processed_img = sia.apply_filters(image_data, filters)
        expected_img = load_image("test_filter_images/expected_image_405.png")

        assert processed_img.shape == expected_img.shape, "Shape mismatch between processed and expected image"

        similarity, _ = ssim(processed_img, expected_img, multichannel=True, full=True)
        assert similarity > 0.98, f"Images differ: SSIM={similarity:.2f}"