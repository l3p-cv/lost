from pydantic import AliasGenerator, BaseModel, ConfigDict, alias_generators


class BaseModelWithCamelCase(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=alias_generators.to_camel,
            validation_alias=alias_generators.to_camel,
        ),
        populate_by_name=True,
    )
