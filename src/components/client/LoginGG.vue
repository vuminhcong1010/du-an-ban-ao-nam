<template>
  <div>
    <button @click="loginGoogle">Đăng nhập với Google</button>
  </div>
</template>


<script>
export default {
  methods: {
    loginGoogle() {
      window.location.href = "http://localhost:8080/auth/authorize/google";
    }
  }
}
</script>



