"""Direct-mode compatibility helpers used by the owner's GenLayer repos."""
import sys

from gltest.direct import loader, vm as direct_vm_module

_original_inject = loader._inject_message_to_fd0


def _inject_message_to_fd0_windows(vm):
    try:
        _original_inject(vm)
    except PermissionError:
        return None


loader._inject_message_to_fd0 = _inject_message_to_fd0_windows

_original_warp = direct_vm_module.VMContext.warp


def _warp_with_message_refresh(context, timestamp):
    _original_warp(context, timestamp)
    sdk_gl = sys.modules.get("genlayer.gl")
    if sdk_gl is not None and getattr(sdk_gl, "message_raw", None) is not None:
        sdk_gl.message_raw["datetime"] = timestamp


direct_vm_module.VMContext.warp = _warp_with_message_refresh
