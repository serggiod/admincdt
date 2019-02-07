window.dhx4.application = {
	init:function(){

        // Adjuntar a la pagina web un contenedor de aplicación
        // y un objeto windows.
        window.dhx4.application.mdi = new dhtmlXLayoutObject('dhx4AppContainer','2U','dhx_skyblue');
        window.dhx4.application.windows = new dhtmlXWindows();
        
        // Adjuntar Menu Principal.
        menu = window.dhx4.application.mdi.attachMenu();
        menu.setIconsPath('/imgcdn/icons/');
        menu.addNewSibling(null,'archivo','Archivo',false,'application-blue.png','application-blue.png');
        menu.addNewChild('archivo',0,'applications','Cambiar de aplicación',false,'applications-blue.png','applications-blue.png');
        menu.addNewChild('archivo',1,'logout','Salir de la aplicación',false,'cross-button.png','cross-button.png');
        menu.addNewSibling('archivo','herramientas','Herramientas',false,'wrench-screwdriver.png','wrench-screwdriver.png');
        menu.addNewChild('herramientas',0,'createdir','Crear un directorio',false,'folder--plus.png','folder--plus.png');
        menu.addNewChild('herramientas',1,'deletedir','Eliminar un directorio',false,'folder--minus.png','folder--minus.png');
        menu.addNewChild('herramientas',2,'createfile','Subir un archivo',false,'document--plus.png','document--plus.png');
        menu.addNewChild('herramientas',3,'deletefile','Eliminar un archivo',false,'document--minus.png','document--minus.png');
        menu.addNewSibling('herramientas','ayuda','Ayuda',false,'question-button.png','question-button.png');
        menu.addNewChild('ayuda',0,'acercade','Acerca de...',false,'information-button.png','information-button.png');
        menu.attachEvent('onclick',window.dhx4.application.handlers.events);

        // Adjuntar barra de herramientas.
        toolbar = window.dhx4.application.mdi.attachToolbar();
        toolbar.setIconsPath('/imgcdn/icons/');
        toolbar.addButton('createdir',0,'Crear un directorio','folder--plus.png','folder--plus.png');
        toolbar.addButton('deletedir',1,'Eliminar un directorio','folder--minus.png','folder--minus.png');
        toolbar.addButton('createfile',2,'Subir un archivo','document--plus.png','document--plus.png');
        toolbar.addButton('deletefile',3,'Eliminar un archivo','document--minus.png','document--minus.png');
        toolbar.attachEvent('onclick',window.dhx4.application.handlers.events);
        
        // Adjuntar izquierda arbol de directorios.
        window.dhx4.application.mdi.cells('a').setText('Directorios');
        window.tree = window.dhx4.application.mdi.cells('a').attachTree();
        window.tree.setImagesPath('/jscdn/dhtmlx/imgs/dhxtree_skyblue/');
        window.tree.load('/rest/ful/admincdt/index.php/carpetas?path=/',null,'json');
        window.tree.attachEvent('onselect',window.dhx4.application.handlers.loadDirContent);

        // Adjuntar derecha lista de archivos.
        window.dhx4.application.mdi.cells('b').setText('Contenido');
        window.files = window.dhx4.application.mdi.cells('b').attachGrid();
        window.files.setImagesPath('/jscdn/dhtmlx/imgs/dhxgrid_skyblue/');
        window.files.setHeader('Archivo');
        window.files.setInitWidths('*');
        window.files.setColAlign('left');
        window.files.setColTypes('ro');
        window.files.setColSorting('str');
        window.files.load('/rest/ful/admincdt/index.php/archivos?path=/',null,'json');
        window.files.init();
	},

    // Manejadores de eventos.
    handlers:{
        events:function(event){
            if(event==='applications') window.dhx4.application.handlers.applications();
            if(event==='logout') window.dhx4.application.handlers.logout();
            if(event==='acercade') window.dhx4.application.handlers.acercade();
            if(event==='createdir') window.dhx4.application.handlers.createdir();
            if(event==='deletedir') window.dhx4.application.handlers.deletedir();
            if(event==='createfile') window.dhx4.application.handlers.createfile();
            if(event==='deletefile') window.dhx4.application.handlers.deletefile();
        },
        loadDirContent:function(){
            window.dhx4.application.mdi.progressOn();
            path = window.tree.getSelectedItemId();
            window.files.clearAndLoad('/rest/ful/admincdt/index.php/archivos?path='+path,function(){
                window.dhx4.application.mdi.progressOff();
            },'json');
            
        },
        applications:function(){ 
            location = document.location | window.location;
            location.href = '/login/#/applications';
        },
        logout:function(){
            location = document.location | window.location;
            location.href = '/login/#/logout';
        },
        acercade:function(){
            alert('Aplicación desarrollada en el Centro de Cómputos de la Legislatura de Jujuy.')
        },
        createdir:function(){
            win = window.dhx4.application.windows.createWindow('win',0,0,350,120);
            win.setText('Nuevo directorio');
            win.setModal(true);
            win.centerOnScreen();
            win.denyResize();
            win.denyMove();
            win.button('help').hide();
            win.button('stick').hide();
            win.button('park').hide();
            win.button('minmax').hide();
            win.button('close').hide();

            toolbar = win.attachToolbar();
            toolbar.setIconsPath('/imgcdn/icons/');
            toolbar.addButton('guardar',0,'Guardar','disk--plus.png','disk--plus.png');
            toolbar.addButton('cancelar',1,'Cancelar','cross-button.png','cross-button.png');
            toolbar.attachEvent('onclick',function(event){
                if(event==='cancelar') win.close();
                if(event==='guardar'){
                    if(form.validate()===true){
                        window.dhx4.session.autorize(function(){
                            uri  = '/rest/ful/admincdt/index.php/createdir';
                            path = window.tree.getSelectedItemId();
                            name = form.getItemValue('name').toUpperCase();
                            json = {dirname:path+'/'+name};
                            window.dhx4.application.mdi.progressOn();
                            window.dhx4.ajax.post(uri,JSON.stringify(json),function(rta){
                                json = JSON.parse(rta.xmlDoc.responseText);
                                if(json.result===false) dhtmlx.alert({type:'alert-error',title:'Error',text:'No se puede crear el directorio',ok:'Aceptar'});
                                if(json.result===true){
                                    parent = path;
                                    if(path==='') parent='0';
                                    window.tree.insertNewItem(
                                        parent, // parent id.
                                        path+'/'+name, // this id.
                                        name, //text.
                                        window.dhx4.application.handlers.loadDirContent,
                                        'folderClosed.gif',
                                        'folderOpen.gif',
                                        'folderClosed.gif');
                                    win.close();
                                }
                                window.dhx4.application.mdi.progressOff();
                            });
                        });
                    }
                    else dhtmlx.message({title:'Error',type:'alert-error',text:'Debe ingresar un nombre.',ok:'Aceptar'});
                }
            });

            items = [{type:'input',name:'name',label:'Nombre:',labelWidth:80,inputWidth:210,required:true}];
            form = win.attachForm();
            form.loadStruct(items,'json');
        },
        deletedir:function(){
            var dirname = window.tree.getSelectedItemId(); 
            if(dirname==='') dhtmlx.alert({type:'alert-error',title:'Error',text:'Debe seleccionar un directorio.',ok:'Aceptar'});
            else{
                dhtmlx.confirm({
                    type:'alert-warning',
                    title:'Eliminar un directorio',
                    text:'¿Desea eliminar este directorio?',
                    ok:'Aceptar',
                    cancel:'Cancelar',
                    callback:function(event){
                        if(event===true){
                            window.dhx4.session.autorize(function(){
                                uri = '/rest/ful/admincdt/index.php/deletedir';
                                json = {dirname:dirname};
                                window.dhx4.application.mdi.progressOn();
                                window.dhx4.ajax.post(uri,JSON.stringify(json),function(rta){
                                    json = JSON.parse(rta.xmlDoc.responseText);
                                    if(json.result===false) dhtmlx.alert({type:'alert-error',title:'Error',text:'No se puedo eliminar el directorio.',ok:'Aceptar'});
                                    if(json.result===true) dhtmlx.alert({
                                        type:'alert',
                                        title:'Ok',
                                        text:'El directorio se elimino en forma correcta.',
                                        ok:'Aceptar',
                                        callback:function(){ window.tree.deleteItem(dirname,true); }
                                    });
                                    window.dhx4.application.mdi.progressOff();
                                });
                            });
                        }
                    }
                });
            }
        },
        createfile:function(){
            var files = new Array();
            dirname = window.tree.getSelectedItemId();
            if(window.dirname==='') dhtmlx.message({type:'alert-error',title:'Error',text:'No se puede subir un archivo al directorio raíz.',ok:'Aceptar'});
            else{
                input = document.createElement('input');
                input.type='file';
                input.lang='es';
                input.multiple=false;
                input.accept='application/pdf';
                input.click();
                input.addEventListener('change',function(){
                    window.dhx4.application.mdi.progressOn();
                    for(i=0;i<input.files.length;i++){
                        reader = new FileReader();
                        reader.fileLength = input.files.length;
                        reader.fileName = dirname+'/'+input.files[i].name;
                        reader.readAsDataURL(input.files[i]);
                        reader.addEventListener('loadend',function(file){
                            files.push({
                                name:file.target.fileName,
                                content:file.target.result
                            });
                            if(files.length===file.target.fileLength){
                                window.dhx4.session.autorize(function(){
                                    for(i=0;i<files.length;i++){
                                        uri = '/rest/ful/admincdt/index.php/createfile';
                                        window.dhx4.ajax.post(uri,JSON.stringify(files[i]),function(rta){
                                            json=JSON.parse(rta.xmlDoc.responseText);
                                            if(json.result===true) window.dhx4.application.handlers.loadDirContent();
                                            else dhtmlx.message({type:'alert-error',title:'Error',text:'No se pudo crear el archivo',ok:'Aceptar'});
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        deletefile:function(){
            var name = window.files.getSelectedRowId();
            if(name===null) dhtmlx.alert({type:'alert-error',title:'Error',text:'Debe selecccionar un archivo',ok:'Aceptar'});
            else dhtmlx.confirm({
                type:'alert-warning',
                title:'Confirmar',
                text:'¿Esta seguro que desea eliminar este archivo?',
                ok:'Aceptar',
                cancel:'Cancelar',
                callback:function(bool){
                    if(bool===true){
                        window.dhx4.application.mdi.progressOn();
                        uri = '/rest/ful/admincdt/index.php/deletefile';
                        window.dhx4.ajax.post(uri,JSON.stringify({name:name}),function(rta){
                            json = JSON.parse(rta.xmlDoc.responseText);
                            if(json.result===true) window.dhx4.application.handlers.loadDirContent();
                            else dhtmlx.alert({type:'alert-error',title:'Error',text:'No se pudo eliminar el archivo',ok:'Aceptar'});
                            window.dhx4.application.mdi.progressOff();
                        });
                    }
                }
            });
        }

    }
};