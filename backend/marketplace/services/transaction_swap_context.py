from dataclasses import dataclass

SWAP_CONTEXT_PREFIX = "SWAPCTX"
MEETING_NOT_DEFINED = "n"
MEETING_PENDING = "p"
MEETING_ACCEPTED = "a"


@dataclass(frozen=True)
class SwapContext:
    swap_product_id: int
    meeting_status: str
    meeting_proposer_id: int
    meeting_location: str


def encode_swap_context(
    swap_product_id: int,
    meeting_status: str = MEETING_NOT_DEFINED,
    meeting_proposer_id: int = 0,
    meeting_location: str = "",
) -> str:
    normalized_location = meeting_location.strip()
    return (
        f"{SWAP_CONTEXT_PREFIX}|{swap_product_id}|{meeting_status}|"
        f"{meeting_proposer_id}|{normalized_location}"
    )


def parse_swap_context(raw_value: str | None) -> SwapContext | None:
    if not raw_value:
        return None

    parts = raw_value.split("|", 4)
    if len(parts) != 5 or parts[0] != SWAP_CONTEXT_PREFIX:
        return None

    try:
        swap_product_id = int(parts[1])
        meeting_proposer_id = int(parts[3])
    except ValueError:
        return None

    meeting_status = parts[2]
    if meeting_status not in {MEETING_NOT_DEFINED, MEETING_PENDING, MEETING_ACCEPTED}:
        return None

    return SwapContext(
        swap_product_id=swap_product_id,
        meeting_status=meeting_status,
        meeting_proposer_id=meeting_proposer_id,
        meeting_location=parts[4],
    )


def visible_swap_location(raw_value: str) -> str:
    context = parse_swap_context(raw_value)
    if context is None:
        return raw_value

    if context.meeting_status == MEETING_ACCEPTED:
        return context.meeting_location

    return ""


def swap_meeting_status(raw_value: str) -> str | None:
    context = parse_swap_context(raw_value)
    if context is None:
        return None

    status_map = {
        MEETING_NOT_DEFINED: "not_defined",
        MEETING_PENDING: "pending_acceptance",
        MEETING_ACCEPTED: "accepted",
    }
    return status_map[context.meeting_status]
