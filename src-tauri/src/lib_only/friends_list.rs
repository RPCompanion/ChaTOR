
use std::mem;
use std::ffi::CStr;

use retour::static_detour;

use crate::share::CaptureMessage;

type UpdateFriendsListHookType = extern "C" fn(*const u64, *const i8, i8, *const u64) -> i64;

static_detour! {
    static UpdateFriendsListHook: extern "C" fn(*const u64, *const i8, i8, *const u64) -> i64;
}

const UPDATE_FRIENDS_LIST_ADDRESS: isize = 0x0522e90;

pub unsafe fn begin_detour(base_address: isize) {

    let target: UpdateFriendsListHookType = mem::transmute(base_address + UPDATE_FRIENDS_LIST_ADDRESS);
    match UpdateFriendsListHook.initialize(target, update_friends_list_detour) {
        Ok(_) => {},
        Err(_) => {

        }
    }

}

pub unsafe fn end_detour() {

}

fn update_friends_list_detour(param_1: *const u64, character: *const i8, login_code: i8, param_2: *const u64) -> i64 {

    unsafe {

        // Sometimes t_character is empty. Perhaps the user hasn't fetched the friends list yet?
        if let Ok(character_name) = CStr::from_ptr(character).to_str() {

            // 2 for logged in, 1 for logged out
            let logged_in: bool = login_code == 2;
            todo!("UpdateFriendsListHook");

        }

        return UpdateFriendsListHook.call(param_1, character, login_code, param_2);

    }

}