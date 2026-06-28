<script setup lang="ts">
const {
  form, saveWeaponToLibrary, clearWeaponSlot,
  showLibrary, libraryTab, rulebookSearch, rulebookCategory, importTargetSlot,
  armePersoList, rulebookCategories, filteredRulebook,
  importArmeToSlot, deleteArmePerso, importRulebookToSlot
} = injectCharacterCreation()
</script>

<template>
  <section class="form-section">
    <h2 class="section-title">Armes</h2>
    <div class="weapons-table-wrap">
      <div class="weapons-table">

        <!-- Header -->
        <div class="weapons-header">
          <span>Arme</span>
          <span class="col-center">Ord.</span>
          <span class="col-center">Maj.</span>
          <span class="col-center">Ext.</span>
          <span class="col-center">Dégâts</span>
          <span class="col-center">Portée</span>
          <span class="col-center">Cad.</span>
          <span class="col-center">Cap.</span>
          <span class="col-center">Panne</span>
          <span />
        </div>

        <!-- Arm1 : Corps à corps (nom et dégâts déjà dans le PDF) -->
        <div class="weapons-row weapons-row--melee">
          <span class="weapon-melee-label">Corps à corps</span>
          <span class="weapon-auto">{{ form['Arm1_ORD'] || '—' }}</span>
          <span class="weapon-auto">{{ form['Arm1_MAJ'] || '—' }}</span>
          <span class="weapon-auto">{{ form['Arm1_EXT'] || '—' }}</span>
          <span class="weapon-fixed">—</span>
          <input v-model="form['Arm1_PORT']" class="weapon-input" type="text" placeholder="Allonge">
          <span class="weapon-fixed">—</span>
          <span class="weapon-fixed">—</span>
          <span class="weapon-fixed">—</span>
          <span />
        </div>

        <!-- Arm2–5 : armes libres -->
        <div
          v-for="i in [2, 3, 4, 5]"
          :key="i"
          class="weapons-row"
        >
          <input v-model="form[`ARM${i}`]" class="weapon-input weapon-input--name" type="text" placeholder="Nom de l'arme…">
          <input v-model="form[`Arm${i}_ORD`]" class="weapon-input" type="number" min="0" max="100" placeholder="—">
          <span class="weapon-auto">{{ form[`Arm${i}_MAJ`] || '—' }}</span>
          <span class="weapon-auto">{{ form[`Arm${i}_EXT`] || '—' }}</span>
          <input v-model="form[`Arm${i}_DEG`]" class="weapon-input" type="text" placeholder="—">
          <input v-model="form[`Arm${i}_PORT`]" class="weapon-input" type="text" placeholder="—">
          <input v-model="form[`Arm${i}_CAD`]" class="weapon-input" type="text" placeholder="—">
          <input v-model="form[`Arm${i}_CAP`]" class="weapon-input" type="text" placeholder="—">
          <input v-model="form[`Arm${i}_PANN`]" class="weapon-input" type="text" placeholder="—">
          <span class="weapon-actions">
            <button
              type="button"
              class="weapon-save-btn"
              :disabled="!form[`ARM${i}`]"
              :title="form[`ARM${i}`] ? `Sauvegarder « ${form[`ARM${i}`]} » dans la bibliothèque` : 'Saisir un nom d\'arme d\'abord'"
              @click="saveWeaponToLibrary(i)"
            >💾</button>
            <button
              type="button"
              class="weapon-clear-btn"
              :disabled="!form[`ARM${i}`]"
              title="Vider cette ligne"
              @click="clearWeaponSlot(i)"
            >✕</button>
          </span>
        </div>

      </div>
    </div>

    <!-- ── BIBLIOTHÈQUE ─────────────────────────── -->
    <div class="library-section">
      <button type="button" class="library-toggle" @click="showLibrary = !showLibrary">
        <span class="library-toggle-icon">{{ showLibrary ? '▾' : '▸' }}</span>
        Bibliothèque d'armes
        <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
      </button>

      <div v-show="showLibrary" class="library-panel">
        <!-- Slot cible -->
        <div class="library-target-row">
          <span class="library-target-label">Importer dans</span>
          <div class="library-slot-btns">
            <button
              v-for="s in [2, 3, 4, 5]"
              :key="s"
              type="button"
              class="library-slot-btn"
              :class="{ 'library-slot-btn--active': importTargetSlot === s }"
              @click="importTargetSlot = (s as 2|3|4|5)"
            >ARM{{ s }}</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="library-tabs">
          <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'perso' }" @click="libraryTab = 'perso'">
            Mes armes <span v-if="armePersoList.length" class="library-count">{{ armePersoList.length }}</span>
          </button>
          <button type="button" class="library-tab" :class="{ 'library-tab--active': libraryTab === 'rulebook' }" @click="libraryTab = 'rulebook'">
            Armurerie
          </button>
        </div>

        <!-- Mes armes -->
        <div v-if="libraryTab === 'perso'">
          <p v-if="!armePersoList.length" class="library-empty">Aucune arme sauvegardée. Remplissez un slot ARM2–5 et cliquez 💾.</p>
          <div v-else class="library-list">
            <div v-for="arme in armePersoList" :key="arme.id" class="library-item">
              <div class="library-item-info">
                <span class="library-item-name">{{ arme.nom }}</span>
                <span v-if="arme.deg" class="library-item-meta">{{ arme.deg }}</span>
                <span v-if="arme.port" class="library-item-meta">{{ arme.port }}</span>
              </div>
              <div class="library-item-actions">
                <button type="button" class="btn-import" @click="importArmeToSlot(importTargetSlot, arme)">
                  → ARM{{ importTargetSlot }}
                </button>
                <button type="button" class="btn-delete-arme" @click="deleteArmePerso(arme.id)">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Armurerie (livre de règles) -->
        <div v-else-if="libraryTab === 'rulebook'">
          <div class="rulebook-filters">
            <input v-model="rulebookSearch" class="field-input rulebook-search" type="text" placeholder="Rechercher une arme…">
            <select v-model="rulebookCategory" class="field-select rulebook-cat">
              <option value="">Toutes catégories</option>
              <option v-for="cat in rulebookCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="library-list">
            <div v-for="arme in filteredRulebook" :key="arme.id" class="library-item">
              <div class="library-item-info">
                <span class="library-item-name">{{ arme.name }}</span>
                <span class="library-item-meta">{{ arme.competence.name }}</span>
                <span v-if="arme.damage" class="library-item-meta">{{ arme.damage }}</span>
                <span v-if="arme.range" class="library-item-meta">{{ arme.range }}</span>
              </div>
              <div class="library-item-actions">
                <button type="button" class="btn-import" @click="importRulebookToSlot(importTargetSlot, arme)">
                  → ARM{{ importTargetSlot }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
