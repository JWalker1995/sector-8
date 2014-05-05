#!/bin/sh

sass --scss --update css:css
python js/closure-library/closure/bin/build/closurebuilder.py --root=js/closure-library/ --root=js/sector8/ --namespace="goog.dom" --namespace="sector8.game" --output_mode=compiled --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" --compiler_jar=/home/joel/source/closure-compiler/build/compiler.jar --output_file=js/bundle.js
