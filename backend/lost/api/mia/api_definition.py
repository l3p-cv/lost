from flask_restx import fields

from lost.api.api import api

mia_anno = api.model(
    "MIA Annotation",
    {
        "image": fields.Raw(),
    },
)

prev_model = api.model("MiaPrevPayload", {
    "maxAmount": fields.Integer(required=True),
    "currentAmount": fields.Integer(required=True),
    "firstId": fields.Integer(required=True),
})
