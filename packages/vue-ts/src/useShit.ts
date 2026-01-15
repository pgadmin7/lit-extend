import { ref } from "vue";


const shittyRef = ref<number>(0);
export function useShit() {

    const magicShitRef = ref<number>(10);

    return {
      shittyRef,
      magicShitRef
    };
}