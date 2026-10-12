<template>
  <i-frame :src="url" />
</template>
<script>
import iFrame from '@/components/iFrame/index'
export default {
  name: 'Swagger',
  components: { iFrame },
  data() {
    return {
      url: window.location.origin + '/docs'
    }
  }
}
</script>
