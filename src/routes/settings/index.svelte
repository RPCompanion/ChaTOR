
<script lang="ts">
    import ChatSection from "./_ChatSection.svelte";
    import ChatManualSection from "./_ChatManualSection.svelte";
    import ChatAutomaticSection from "./_ChatAutomaticSection.svelte";
    import ChatLogging from "./_ChatLogging.svelte";
    import ChatLogWindow from "./_ChatLogWindow.svelte";
  import AppSettings from "./_AppSettings.svelte";
</script>

<div class="relative text-center text-2xl bg-slate-800 opacity-95 text-white h-12">Settings</div>
<div class="relative  bg-slate-800 opacity-95 rounded-b-sm shadow-md p-2 flex flex-col gap-2">
    <AppSettings/>
    <ChatSection/>
    <ChatManualSection/>
    <ChatAutomaticSection/>
    <ChatLogging/>
    <ChatLogWindow/>
</div>