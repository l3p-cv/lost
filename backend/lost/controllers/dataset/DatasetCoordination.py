"""Dataset coordination layer - thin routing of endpoint calls to business.

Flow
----
DatasetEndpoint  ->  DatasetCoordination  ->  DatasetBusiness
"""
from __future__ import annotations

from lost.controllers.dataset.DatasetBusiness import DatasetBusiness


class DatasetCoordination:
  """Coordination service for the dataset namespace — thin delegation."""

  def __init__(self, business: DatasetBusiness) -> None:
    self._business = business

  def get_datasets(self) -> list[dict]:
        """List datasets + meta dataset. Delegates to DatasetBusiness.list_datasets."""
        return self._business.list_datasets()

  def create_dataset(self, req) -> dict:
    """Add dataset. Delegates to DatasetBusiness.create_dataset."""
    return self._business.create_dataset(req)

  def update_dataset(self, req) -> None:
    """Update dataset. Delegates to DatasetBusiness.update_dataset."""
    return self._business.update_dataset(req)

  def delete_dataset(self, dataset_id: int) -> None:
    """Delete dataset. Delegates to DatasetBusiness.delete_dataset."""
    return self._business.delete_dataset(dataset_id)

  def get_datasets_paged(self,page_index: int, page_size: int) -> dict:
    """Datasets paged. Delegates to DatasetBusiness.list_datasets_paged."""
    return self._business.list_datasets_paged(page_index,page_size)

  def get_datasets_flat(self) -> dict:
    """Datasets flat. Delegates to DatasetBusiness.flat_datasets."""
    return self._business.flat_datasets()

  def dataset_review(self, user_id: int, dataset_id: int, data: dict) -> dict:
    """Dataset Review. Delegates to DatasetBusiness.review."""
    return self._business.review(user_id,dataset_id,data)

  def dataset_review_image_search(self, dataset_id: int, filter: str, labels: str | None) -> dict:
    """Dataset review search images. Delegates to DatasetBusiness.review_image_search."""
    return self._business.review_image_search(dataset_id,filter,labels)

  def get_possible_labels(self, dataset_id: int) -> list[dict]:
    """Dataset get possible labels. Delegates to DatasetBusiness.possible_labels."""
    return self._business.possible_labels(dataset_id)

  def export_ds_parquet(self, user, dataset_id: int, req) -> str:
    """Dataset parquet-export. Delegates to DatasetBusiness.export_parquet."""
    return self._business.export_parquet(user,dataset_id,req)

  def get_dataset_exports(self, dataset_id: int) -> dict:
    """Get dataset exports list. Delegates to DatasetBusiness.list_exports."""
    return self._business.list_exports(dataset_id)

  def delete_dataset_export(self, user, export_id: int) -> str:
    """Delete dataset export. Delegates to DatasetBusiness.delete_export."""
    return self._business.delete_dataset(user,export_id)

  def download_dataset_export(self, user, export_id: int) -> tuple[bytes, str]:
    """Download Dataset export. Delegates to DatasetBusiness.read_export."""
    return self._business.read_export(user,export_id)
