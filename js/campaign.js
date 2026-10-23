// Datos de la Parte 1 (El Asilo): objetos y enemigos. Coordenadas en tiles.
const _D = (id, x, y) => [id, 'doc', x, y, { doc: id }], _K = (id, key, x, y) => [id, 'key', x, y, { key }], _F = (id, type, x, y) => [id, type, x, y, { fixed: true }];
const Campaign = {
  spawn: [5, 5], boss: [12, 47],
  items: [
    ['a_mat_ss1','screw_small',43,25,{amount:4}], ['a_mat_ps1','powder_small',53,20,{amount:4}], ['a_mat_ss2','screw_small',65,35,{amount:3}], ['a_mat_ps2','powder_small',72,35,{amount:3}], ['a_mat_sg1','screw_large',33,39,{amount:2}], ['a_mat_pg1','powder_large',38,35,{amount:2}], ['a_mat_sg2','screw_large',74,31,{amount:2}], ['a_mat_pg2','powder_large',76,31,{amount:2}],
    _F('caja_a1', 'caja', 9, 8), _F('caja_a2', 'caja', 39, 14), ['pistol', 'pistol', 20, 7], ['stab', 'stab', 24, 7],
    _D('d1', 4, 10), _D('s1', 5, 4), _D('e2', 13, 10), ['a1', 'ammo', 26, 8],
    _K('k1', 'enfermeria', 39, 4), _D('d2', 28, 4), _D('e3', 34, 13), _D('d6', 38, 13), ['ig1', 'inj_green', 28, 12],
    ['a2', 'ammo', 45, 8], _D('d7', 62, 4), _D('e1', 54, 12), _D('f1', 66, 13), ['c2', 'case', 66, 4], ['sh1', 'shells', 65, 6],
    _D('e5', 58, 16), ['a9', 'ammo', 58, 22], _D('d8', 70, 10), _F('safe', 'safe', 75, 6), _F('terminal', 'terminal', 57, 18), ['a3', 'ammo', 33, 22],
    _D('d3', 23, 26), _K('k2', 'almacen', 42, 33), _D('f2', 43, 26), _D('e4', 35, 34), ['ig2', 'inj_green', 22, 35], ['ib1', 'inj_blue', 26, 34], ['ib2', 'inj_blue', 70, 40], ['sh2', 'shells', 40, 34], ['a4', 'ammo', 23, 30],
    ['a5', 'ammo', 50, 30], _D('d4', 64, 28), _D('f3', 65, 27), _K('k3', 'seguridad', 64, 34), ['a6', 'ammo', 63, 29],
    _D('d5', 73, 29), _K('k4', 'director', 80, 34), ['mp', 'mod_prec', 80, 25], ['sh3', 'shells', 78, 26], ['a7', 'ammo', 80, 28], _D('s4', 77, 25),
    _D('s2', 23, 43), ['a8', 'ammo', 32, 39], ['c1', 'case', 33, 44], ['a10', 'ammo', 5, 43], ['a11', 'ammo', 16, 51], ['sh4', 'shells', 13, 52],
    ['mw', 'mod_pow', 73, 17], ['iy1', 'inj_yellow', 71, 20], _D('d9', 75, 19), ['sh5', 'shells', 72, 16],
    _F('sw_cocina', 'sw_cocina', 53, 28), _F('sw_lav', 'sw_lav', 23, 39), _F('sw_enf', 'sw_enf', 23, 34), _F('sw_seg', 'sw_seg', 73, 25)
  ],
  enemies: [
    [1, 'vacio', 33, 5], [2, 'vacio', 30, 9], [3, 'latente', 38, 12], [4, 'vacio', 58, 6], [5, 'vacio', 62, 10], [6, 'trepador', 64, 5], [7, 'vacio', 57, 12],
    [8, 'latente', 55, 23], [9, 'vacio', 60, 22], [10, 'latente', 73, 9], [11, 'vacio', 33, 19], [12, 'vacio', 26, 30], [13, 'vacio', 35, 33], [14, 'trepador', 40, 29],
    [15, 'trepador', 30, 26], [16, 'latente', 38, 34], [17, 'vacio', 56, 31], [18, 'vacio', 62, 29], [19, 'trepador', 60, 34], [20, 'vacio', 76, 28], [21, 'vacio', 78, 33],
    [22, 'trepador', 74, 31], [23, 'vacio', 25, 42], [24, 'vacio', 31, 40], [25, 'latente', 28, 44],
    [26, 'aullador', 63, 12], [27, 'aullador', 59, 28], [28, 'bruto', 60, 8], [29, 'bruto', 34, 31], [30, 'bruto', 77, 30], [31, 'vacio', 47, 30], [32, 'latente', 36, 13], [33, 'trepador', 50, 8], [34, 'vacio', 48, 8], [35, 'trepador', 28, 42]
  ]
};
