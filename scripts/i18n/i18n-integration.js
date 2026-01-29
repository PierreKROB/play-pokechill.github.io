// ===== i18n Integration Functions =====

// Change language function
async function changeLanguage(lang) {
    await i18n.setLanguage(lang);
    updateLanguageProgress();
    
    // Reload current view if needed
    if (typeof updatePreviewTeam === 'function') updatePreviewTeam();
    if (typeof updateItemBag === 'function') updateItemBag();
}

// Update language progress percentages in settings
function updateLanguageProgress() {
    const progressElement = document.getElementById('lang-fr-progress');
    if (progressElement) {
        progressElement.textContent = i18n.getProgress('fr');
    }
    
    // Update selected language
    const langSelect = document.getElementById('settings-language');
    if (langSelect) {
        langSelect.value = i18n.currentLang;
    }
}

// Refresh translations in the current view
function refreshTranslations() {
    updateLanguageProgress();
    
    // Additional UI refresh functions can be called here
}

// Initialize language on page load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateLanguageProgress();
    }, 200);
});
