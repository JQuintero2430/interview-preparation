package dev.interview.javalanguage.m05.support;

import java.lang.classfile.ClassFile;
import java.lang.classfile.ClassModel;
import java.lang.classfile.MethodModel;
import java.lang.classfile.instruction.InvokeDynamicInstruction;
import java.lang.constant.DirectMethodHandleDesc;
import java.lang.reflect.AccessFlag;
import java.util.List;
import java.util.Optional;
import java.util.Set;

// Reads compiled bytes with the Class-File API (java.lang.classfile, final in Java 24) so tests assert what javac
// emitted instead of parsing javap text.
public record ClassFileView(ClassModel model) {

    public static ClassFileView of(byte[] bytes) {
        return new ClassFileView(ClassFile.of().parse(bytes));
    }

    public List<InvokeDynamicInstruction> invokeDynamics() {
        return model.methods().stream()
                .flatMap(method -> method.code().stream())
                .flatMap(code -> code.elementStream())
                .filter(InvokeDynamicInstruction.class::isInstance)
                .map(InvokeDynamicInstruction.class::cast)
                .toList();
    }

    public List<String> bootstrapMethods() {
        return bootstrapMethodsOf(invokeDynamics());
    }

    public List<String> bootstrapMethodsIn(String methodName) {
        List<InvokeDynamicInstruction> sites = model.methods().stream()
                .filter(method -> method.methodName().equalsString(methodName))
                .flatMap(method -> method.code().stream())
                .flatMap(code -> code.elementStream())
                .filter(InvokeDynamicInstruction.class::isInstance)
                .map(InvokeDynamicInstruction.class::cast)
                .toList();
        return bootstrapMethodsOf(sites);
    }

    private static List<String> bootstrapMethodsOf(List<InvokeDynamicInstruction> sites) {
        return sites.stream()
                .map(InvokeDynamicInstruction::bootstrapMethod)
                .map(ClassFileView::qualifiedName)
                .toList();
    }

    public List<String> methodNames() {
        return model.methods().stream()
                .map(method -> method.methodName().stringValue())
                .toList();
    }

    public Optional<MethodModel> firstMethodStartingWith(String prefix) {
        return model.methods().stream()
                .filter(method -> method.methodName().stringValue().startsWith(prefix))
                .findFirst();
    }

    public static Set<AccessFlag> flagsOf(MethodModel method) {
        return method.flags().flags();
    }

    private static String qualifiedName(DirectMethodHandleDesc handle) {
        String owner = handle.owner().packageName() + "." + handle.owner().displayName();
        return owner + "." + handle.methodName();
    }
}
