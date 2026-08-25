"""Direct tests against the production LabelLedger contract."""
import hashlib
import json

SDK_VERSION = "v0.2.12"
OTHER = bytes.fromhex("22" * 20)
RUBRIC_BODY = (
    "Intent classification rubric. PAYMENT_DISPUTE applies when the core failure is payment, charge, refund, or billing. "
    "DELIVERY_DISPUTE applies when paid goods or services were not delivered or completed. "
    "IDENTITY_DISPUTE applies when identity, impersonation, or account ownership is the core issue."
)
RUBRIC_DIGEST = hashlib.sha256(RUBRIC_BODY.encode()).hexdigest()
RUBRIC_URL = "https://example.com/labelledger-rubric.txt"

SCHEMA = json.dumps(
    [
        {"id": "PAYMENT_DISPUTE", "name": "Payment dispute", "definition": "Billing, charge, refund, or payment failure is the core dispute."},
        {"id": "DELIVERY_DISPUTE", "name": "Delivery dispute", "definition": "Paid goods or services were not delivered or completed as promised."},
        {"id": "IDENTITY_DISPUTE", "name": "Identity dispute", "definition": "Identity, impersonation, access, or account ownership is the core dispute."},
    ]
)
SCHEMA_V2 = json.dumps(
    [
        {"id": "PAYMENT_DISPUTE", "name": "Payment dispute", "definition": "A payment, billing, charge, or refund issue dominates."},
        {"id": "DELIVERY_DISPUTE", "name": "Delivery dispute", "definition": "A promised good or service was not delivered or completed."},
        {"id": "IDENTITY_DISPUTE", "name": "Identity dispute", "definition": "Identity or account ownership is disputed."},
        {"id": "QUALITY_DISPUTE", "name": "Quality dispute", "definition": "Delivery occurred, but quality materially failed the stated standard."},
    ]
)
SAMPLE = "they say the job was done but I still haven't received what I paid for"
SAMPLE_DIGEST = hashlib.sha256(SAMPLE.encode()).hexdigest()
DISAGREEMENT = json.dumps({"votes": {"PAYMENT_DISPUTE": 2, "DELIVERY_DISPUTE": 3}, "note": "split between payment and non-delivery"})


def deploy(direct_deploy):
    return direct_deploy("contracts/labelledger.py", sdk_version=SDK_VERSION)


def create_dataset(contract):
    return contract.create_dataset("Intent disputes", RUBRIC_URL, RUBRIC_DIGEST, SCHEMA)


def open_demo_case(contract, dataset_id=1, sample=SAMPLE, disagreement=DISAGREEMENT):
    digest = hashlib.sha256(sample.encode()).hexdigest()
    return contract.open_case(dataset_id, "demo:intent:001", digest, sample, disagreement)


def mock_rubric(vm):
    vm.mock_web(r"https://example\.com/labelledger-rubric\.txt", {"status": 200, "body": RUBRIC_BODY})


def mock_decision(vm, decision="RESOLVE", label="DELIVERY_DISPUTE", ambiguity="LABEL_BOUNDARY", material=False):
    vm.mock_llm(
        r"LabelLedger's rubric-bound classification adjudicator",
        json.dumps(
            {
                "decision": decision,
                "label_id": label if decision == "RESOLVE" else "",
                "ambiguity_class": ambiguity,
                "precedent_material": material,
                "reason": "The rubric makes non-delivery the material boundary.",
            }
        ),
    )


def test_dataset_creation_normalizes_schema_and_exposes_owner(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_deploy)
    direct_vm.sender = direct_alice
    dataset_id = create_dataset(contract)
    dataset = contract.get_dataset(dataset_id)
    assert dataset["dataset_id"] == 1
    assert dataset["rubric_version"] == 1
    assert dataset["case_count"] == 0
    assert len(json.loads(dataset["label_schema_json"])) == 3
    assert json.loads(dataset["label_schema_json"])[0]["id"] == "PAYMENT_DISPUTE"


def test_schema_rejects_duplicate_and_too_few_labels(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    duplicate = json.dumps([
        {"id": "ONE", "name": "One", "definition": "one"},
        {"id": "ONE", "name": "Two", "definition": "two"},
        {"id": "THREE", "name": "Three", "definition": "three"},
    ])
    with direct_vm.expect_revert("duplicate label id"):
        contract.create_dataset("Bad", RUBRIC_URL, RUBRIC_DIGEST, duplicate)
    too_few = json.dumps([
        {"id": "ONE", "name": "One", "definition": "one"},
        {"id": "TWO", "name": "Two", "definition": "two"},
    ])
    with direct_vm.expect_revert("3 to 8"):
        contract.create_dataset("Bad", RUBRIC_URL, RUBRIC_DIGEST, too_few)


def test_open_case_requires_owner_and_exact_text_digest(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_deploy)
    direct_vm.sender = direct_alice
    create_dataset(contract)
    with direct_vm.prank(OTHER), direct_vm.expect_revert("dataset owner only"):
        open_demo_case(contract)
    with direct_vm.expect_revert("sample digest does not match"):
        contract.open_case(1, "demo:intent:001", "0" * 64, SAMPLE, DISAGREEMENT)
    case_id = open_demo_case(contract)
    case = contract.get_case(case_id)
    assert case["status"] == "ESCALATED"
    assert case["rubric_version"] == 1
    assert case["sample_digest"] == SAMPLE_DIGEST
    assert case["memory_inserted"] is False


def test_disagreement_requires_two_nonzero_allowed_labels(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    one_sided = json.dumps({"votes": {"PAYMENT_DISPUTE": 5, "DELIVERY_DISPUTE": 0}})
    with direct_vm.expect_revert("not disputed"):
        open_demo_case(contract, disagreement=one_sided)
    unknown = json.dumps({"votes": {"PAYMENT_DISPUTE": 2, "NOT_A_LABEL": 2}})
    with direct_vm.expect_revert("unknown label"):
        open_demo_case(contract, disagreement=unknown)


def test_rubric_updates_do_not_rewrite_open_case_schema(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_id = open_demo_case(contract)
    version = contract.update_rubric(1, RUBRIC_URL, RUBRIC_DIGEST, SCHEMA_V2)
    assert version == 2
    dataset = contract.get_dataset(1)
    case = contract.get_case(case_id)
    assert dataset["rubric_version"] == 2
    assert case["rubric_version"] == 1
    assert len(json.loads(case["label_schema_json"])) == 3
    assert len(json.loads(contract.get_rubric(1, 2)["label_schema_json"])) == 4


def test_resolve_case_stores_allowed_label_and_inserts_memory_once(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_id = open_demo_case(contract)
    mock_rubric(direct_vm)
    mock_decision(direct_vm)
    result = json.loads(contract.resolve_case(case_id))
    case = contract.get_case(case_id)
    assert result["decision"] == "RESOLVE"
    assert result["status"] == "RESOLVED"
    assert case["final_label"] == "DELIVERY_DISPUTE"
    assert case["memory_inserted"] is True
    assert contract.get_dataset(1)["resolved_count"] == 1
    with direct_vm.expect_revert("not reviewable"):
        contract.resolve_case(case_id)


def test_malformed_or_unknown_consensus_label_fails_closed(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_id = open_demo_case(contract)
    mock_rubric(direct_vm)
    mock_decision(direct_vm, label="INVENTED_LABEL")
    with direct_vm.expect_revert("outside allowed schema"):
        contract.resolve_case(case_id)
    assert contract.get_case(case_id)["status"] == "ESCALATED"


def test_missing_rubric_evidence_abstains_without_memory(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_id = open_demo_case(contract)
    direct_vm.mock_web(r"https://example\.com/labelledger-rubric\.txt", {"status": 404, "body": "missing"})
    result = json.loads(contract.resolve_case(case_id))
    case = contract.get_case(case_id)
    assert result["decision"] == "ABSTAIN"
    assert case["status"] == "ABSTAINED"
    assert case["final_label"] == ""
    assert case["memory_inserted"] is False
    assert contract.get_dataset(1)["resolved_count"] == 0


def test_digest_mismatched_rubric_abstains_without_calling_positive_path(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_id = open_demo_case(contract)
    direct_vm.mock_web(r"https://example\.com/labelledger-rubric\.txt", {"status": 200, "body": "tampered rubric content that does not match the registered digest"})
    result = json.loads(contract.resolve_case(case_id))
    assert result["decision"] == "ABSTAIN"
    assert contract.get_case(case_id)["status"] == "ABSTAINED"


def test_void_is_owner_only_and_terminal(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_deploy)
    direct_vm.sender = direct_alice
    create_dataset(contract)
    case_id = open_demo_case(contract)
    with direct_vm.prank(OTHER), direct_vm.expect_revert("dataset owner only"):
        contract.void_case(case_id, "duplicate escalation")
    contract.void_case(case_id, "duplicate escalation")
    assert contract.get_case(case_id)["status"] == "VOIDED"
    with direct_vm.expect_revert("only unresolved"):
        contract.void_case(case_id, "again")


def test_cross_dataset_vectors_never_become_precedents(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_a = open_demo_case(contract)
    mock_rubric(direct_vm)
    mock_decision(direct_vm)
    contract.resolve_case(case_a)

    dataset_b = contract.create_dataset("Other intent set", RUBRIC_URL, RUBRIC_DIGEST, SCHEMA)
    case_b = open_demo_case(contract, dataset_id=dataset_b, sample="the package never arrived although the seller says shipped")
    precedents = contract.preview_precedents(case_b, 6)
    assert precedents == []


def test_same_dataset_resolved_case_can_be_previewed_as_related_context(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    first = open_demo_case(contract)
    mock_rubric(direct_vm)
    mock_decision(direct_vm)
    contract.resolve_case(first)
    second = open_demo_case(contract, sample="I paid for the service but the promised work never arrived")
    precedents = contract.preview_precedents(second, 6)
    assert len(precedents) == 1
    assert precedents[0]["case_id"] == first
    assert precedents[0]["same_rubric"] is True
    assert "distance" in precedents[0]
    assert "confidence" not in precedents[0]


def test_epoch_requires_terminal_cases_from_one_rubric_version(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    case_one = open_demo_case(contract)
    contract.void_case(case_one, "fixture terminal")
    epoch = contract.seal_epoch(1, "sha256:" + ("a" * 64), "a" * 64, json.dumps([case_one]))
    receipt = contract.get_epoch(epoch)
    assert receipt["rubric_version"] == 1
    assert receipt["case_ids"] == [case_one]

    case_two = open_demo_case(contract, sample="I was billed twice and want the extra charge reversed")
    contract.update_rubric(1, RUBRIC_URL, RUBRIC_DIGEST, SCHEMA_V2)
    # case_two is still version 1; open one under v2 to prove mixed-version rejection.
    case_three = open_demo_case(contract, sample="the delivered item is damaged and unusable", disagreement=json.dumps({"votes": {"DELIVERY_DISPUTE": 2, "QUALITY_DISPUTE": 2}}))
    contract.void_case(case_two, "terminal v1")
    contract.void_case(case_three, "terminal v2")
    with direct_vm.expect_revert("share rubric version"):
        contract.seal_epoch(1, "sha256:" + ("b" * 64), "b" * 64, json.dumps([case_two, case_three]))


def test_list_cases_filters_and_bounds_pagination(direct_vm, direct_deploy):
    contract = deploy(direct_deploy)
    create_dataset(contract)
    first = open_demo_case(contract)
    second = open_demo_case(contract, sample="I paid and nothing was delivered")
    contract.void_case(second, "test")
    assert contract.list_cases(1, 0, 0, 20) == [first, second]
    assert contract.list_cases(1, 5, 0, 20) == [second]
    with direct_vm.expect_revert("pagination"):
        contract.list_cases(1, 0, 0, 51)
