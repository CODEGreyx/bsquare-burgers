/** Shared Lenis instance so nav links / filming shortcuts can drive it. */
let instance = null
export const setLenis = (l) => {
  instance = l
}
export const getLenis = () => instance
