const vClickOutside = {
    mounted(element: any, binding: any) {
        element.clickOutsideEvent = function(event: any) {
            if (!(element === event.target || element.contains(event.target))) {
                binding.value(event, element);
            }
        };
        document.body.addEventListener("click", element.clickOutsideEvent, true);
    },
    unmounted(element: any) {
        document.body.removeEventListener("click", element.clickOutsideEvent, true);
    }
};

export {
    vClickOutside
};