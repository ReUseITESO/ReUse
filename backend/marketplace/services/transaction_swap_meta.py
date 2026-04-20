from urllib.parse import parse_qs, quote, unquote

SWAP_META_PREFIX = "swapmeta:"

SWAP_STAGE_PROPOSAL_PENDING = "proposal_pending"
SWAP_STAGE_PROPOSAL_REJECTED = "proposal_rejected"
SWAP_STAGE_PROPOSAL_ACCEPTED = "proposal_accepted"
SWAP_STAGE_AGENDA_PENDING = "agenda_pending"
SWAP_STAGE_AGENDA_REJECTED = "agenda_rejected"
SWAP_STAGE_AGENDA_ACCEPTED = "agenda_accepted"

SWAP_STAGES = {
    SWAP_STAGE_PROPOSAL_PENDING,
    SWAP_STAGE_PROPOSAL_REJECTED,
    SWAP_STAGE_PROPOSAL_ACCEPTED,
    SWAP_STAGE_AGENDA_PENDING,
    SWAP_STAGE_AGENDA_REJECTED,
    SWAP_STAGE_AGENDA_ACCEPTED,
}


def build_swap_meta(
    proposed_product_id,
    stage,
    agenda_location=None,
):
    if stage not in SWAP_STAGES:
        raise ValueError("Swap stage inválido.")

    if proposed_product_id is None:
        raise ValueError("Se requiere proposed_product_id.")

    payload = f"p={int(proposed_product_id)}&s={stage}"
    if agenda_location:
        payload = f"{payload}&l={quote(agenda_location, safe='')}"

    encoded = f"{SWAP_META_PREFIX}{payload}"
    if len(encoded) > 255:
        raise ValueError("Los metadatos temporales de intercambio exceden el límite.")

    return encoded


def parse_swap_meta(raw_delivery_location):
    if not raw_delivery_location or not raw_delivery_location.startswith(
        SWAP_META_PREFIX
    ):
        return None

    raw_payload = raw_delivery_location[len(SWAP_META_PREFIX) :]
    parsed = parse_qs(raw_payload, keep_blank_values=False)

    product_values = parsed.get("p")
    stage_values = parsed.get("s")

    if not product_values or not stage_values:
        return None

    try:
        proposed_product_id = int(product_values[0])
    except (TypeError, ValueError):
        return None

    stage = stage_values[0]
    if stage not in SWAP_STAGES:
        return None

    location_values = parsed.get("l")
    agenda_location = unquote(location_values[0]) if location_values else None

    return {
        "proposed_product_id": proposed_product_id,
        "swap_stage": stage,
        "agenda_location": agenda_location,
    }


def extract_swap_stage(raw_delivery_location):
    metadata = parse_swap_meta(raw_delivery_location)
    if not metadata:
        return None
    return metadata["swap_stage"]


def extract_proposed_product_id(raw_delivery_location):
    metadata = parse_swap_meta(raw_delivery_location)
    if not metadata:
        return None
    return metadata["proposed_product_id"]


def extract_agenda_location(raw_delivery_location):
    metadata = parse_swap_meta(raw_delivery_location)
    if not metadata:
        return None
    return metadata.get("agenda_location")
